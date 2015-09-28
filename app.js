var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var file = "canonFileLocation.db";
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

//db.serialize(function() {
//    db.run("CREATE TABLE IF NOT EXISTS location (id INTEGER PRIMARY KEY, html VARCHAR(200), images VARCHAR(200))");
//
//    var stmt = db.prepare("INSERT INTO location VALUES(?,?,?)");
//
//    for (var i = 0; i < 2; i++) {
//        stmt.run(null, "canonmg_4480 " + i, '/images/canonmg_4480.jpg');
//    }
//    stmt.finalize();
//
//    db.each("SELECT rowid AS id, info FROM location", function(err, row) {
//        console.log(row.id + ": " + row.info);
//    });
//});
//db.close();

app.get('/scrape', function(req, res) {

    url = 'http://www.canon-europe.com/printers/inkjet/maxify/maxify_mb2040';
    canonUrl = "http://www.canon-europe.com";

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
                var imgIs = $(this).attr('src');
                imgs.push(imgIs);
            });
            $('.c-product-thumbs-4').find('a').each(function() {
               var bigImg = $(this).attr('href');
                imgs.push(bigImg);
            });

            for (var j = 0; j < imgs.length; j++) {
                var imgName = imgs[j].split('/');
                var imgSrc = imgName[2];
                request(canonUrl + '/images/' + imgSrc).pipe(fs.createWriteStream('images/' + imgSrc));
            }
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