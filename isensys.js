var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

function pixma() {

    canonUrl = 'http://www.canon-europe.com/for_home/product_finder/multifunctionals/laser/';
    domain = 'http://www.canon-europe.com/';

    links = [
        "i-sensys_mf8580cdw"
        , "i-sensys_mf9220cdn"
        , "i-sensys_mf8550cdn"
        , "i-sensys_mf9280cdn"
        , "i-sensys_mf8540cdn"
        , "i-sensys_mf8280cw"
        , "i-sensys_mf8230cn"
        , "i-sensys_mf6180dw"
        , "i-sensys_mf6140dn"
        , "i-sensys_mf4890dw"
        , "i-sensys_mf4870dn"
        , "i-sensys_mf4780w"
        , "i-sensys_mf4750"
        , "i-sensys_mf4730"
        , "i-sensys_mf4410"
        , "i-sensys_mf3010"
        , "i-sensys_mf211"
        , "i-sensys_mf212w"
        , "i-sensys_mf216n"
        , "i-sensys_mf217w"
        , "i-sensys_mf226dn"
        , "i-sensys_mf229dw"
        , "i-sensys_mf623cn"
        , "i-sensys_mf628cw"
        , "i-sensys_mf724cdw"
        , "i-sensys_mf728cdw"
        , "i-sensys_mf729cx"
        , "i-sensys_mf5980dw"
        , "i-sensys_mf5940dn"
    ];

    request(canonUrl, function(error, response, html) {
        if(!error) {
            for (var i = 0; i < links.length; i++) {
                var urlscrap = canonUrl + links[i];
                writeHtml(urlscrap);
                writeImages(urlscrap);
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
                $('div.c-full-section').remove();
                $('script').remove();

                content = data.html();
                var cutcontent = urlToParse.split('/');
                var htmlToSave = cutcontent[7] + '.html';
                console.log(htmlToSave);

                fs.writeFile('html/' + htmlToSave, content, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
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
                console.log(imgSrc);
                request(domain + '/images/' + imgSrc).pipe(fs.createWriteStream('images/' + imgSrc));
            }
        }
    });
}
pixma();