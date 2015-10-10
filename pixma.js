var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var file = "printerInfo.sqlite";
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

function pixma() {

    url = 'http://www.canon-europe.com/printers/inkjet/pixma/range/';
    canonUrl = "http://www.canon-europe.com";

    request(url, function(error, response, html) {
        if(!error) {
            var $ = cheerio.load(html);

            var content;
            var imgs = [];
            var pixmaall = [];


            $('#c-content').find('.c-wrapper-100').each(function () {
                var data = $(this);
                data.find('a').each(function () {
                    var pixmaprinter = $(this).attr('href');

                    if (pixmaprinter && pixmaprinter.length > 20) {
                        pixmaall.push(pixmaprinter);
                    }
                });
            });

            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }

            var pixmaallunique = pixmaall.filter(onlyUnique);

            for (var i = 0; i < pixmaallunique.length; i++) {
                console.log(pixmaallunique[i]);

                var urlpixma = canonUrl + pixmaallunique[i];

                writeHtml(urlpixma);
                writeImages(urlpixma);

            }
        }
    });
}

function writeHtml(urlToParse) {
    request(urlToParse, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            var content;

            $('#c-content').filter(function () {
                var data = $(this);
                $('li[class=c-last]').remove();
                $('#p-accessories').remove();
                $('.c-grid.c-g4.c-gmp2').remove();

                content = data.html();
            });

            var cutcontent = urlToParse.split('/');
            var htmlToSave = cutcontent[6] + '.html';
            console.log(htmlToSave);

            fs.writeFile('html/' + htmlToSave, content, function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        }
    });
}

function writeImages(urlToParse) {
    request(urlToParse, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            var imgs = [];

            $('#c-content').find('img').each(function () {
                var imgIs = $(this).attr('src');
                imgs.push(imgIs);
            });
            $('.c-product-thumbs-4').find('a').each(function () {
                var bigImg = $(this).attr('href');
                imgs.push(bigImg);
            });

            for (var j = 0; j < imgs.length; j++) {
                var imgName = imgs[j].split('/');
                var imgSrc = imgName[2];
                request(canonUrl + '/images/' + imgSrc).pipe(fs.createWriteStream('images/' + imgSrc));
            }
        }
    });
}

pixma();