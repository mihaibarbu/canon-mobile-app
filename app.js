var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res) {

    url = 'http://www.canon-europe.com/printers/inkjet/maxify/maxify_mb2040/';

    request(url, function(error, response, html) {
        if(!error){
            var $ = cheerio.load(html);

            var content;
            var imgs = [];

            $('#c-content').filter(function() {
                var data = $(this);
                $('li[class=c-last]').remove();
                $('#p-accessories').remove();
                $('.c-grid.c-g4.c-gmp2').remove();

                content = data.html();
            });

            $('#c-content').find('img').each(function() {
                var imgSrc = $(this).attr('src');
                imgs.push(imgSrc);
            });
            console.log(imgs);

        }


        fs.writeFile("maxify_mb2040.html", content, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });

        res.send('Check your console!')
    })
});

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app; 	