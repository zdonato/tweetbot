var Twitter = require('twitter');
var nodemailer = require('nodemailer');
var emailInfo = require('./emailInfo');
var jsonfile = require('jsonfile');
var timestamp = require('timestamp-util');

var client = new Twitter({
    consumer_key: 'LHVDDFkFlqY5rKeFJFieTFXXX',
    consumer_secret: 'uhmdO4uSiZsvEgYUGH1VtfwMmWDrn0Kn7NIyM4U9TSgIxiDsYO',
    access_token_key: '56394936-gzOSPp4WmKPpszG2DwHAEGcpi2NXPJiR8Fz2OuY7m',
    access_token_secret: 'CtM4elALYZnKxqO9nQpvkp5FW08vDJcwDzeJafZMFH6Xe'
});

var transporter = nodemailer.createTransport(emailInfo);

// Screen_name: String, keyword: [String]
var getTweets = (screen_name, keywords) => {
    return new Promise( (resolve, reject) => {
        var params = {
            screen_name: screen_name,
            trim_user: true,
            exclude_replies: true
        };

        client.get('statuses/user_timeline', params, (error, tweets, response) => {
            if (!error) {
                var kwTweets = [];

                tweets.forEach( (tweet) => {
                    keywords.forEach( (kw) => {
                        if (tweet.text.toLowerCase().includes(kw)){
                            var obj = {
                                text: tweet.text,
                                id: tweet.id_str
                            };
                            kwTweets.push(obj);
                        }
                    });
                });

                resolve(kwTweets);
            } else {
                reject(error);
            }
        });
    });
};
setInterval( () => {
    getTweets("NJTRANSIT_NBUS", ["bus route no. 119"])
        .then( (tweets) => {
            var mailOptions = {
                from: 'Zacharydonato.com <zdonatowebsiteform@gmail.com>',
                to: 'zacharyadonato@gmail.com',
                subject: "NJ TRANSIT 119 TWEET",
                text: ''
            };

            var storage = jsonfile.readFileSync('./tweets-njt.json');

            tweets.forEach( (tweet) => {

                if (storage.indexOf(tweet.id) === -1) {
                    // Tweet hasn't been seen yet.
                    var link = "https://twitter.com/NJTRANSIT_NBUS/status/" + tweet.id;
                    mailOptions.text += tweet.text + "\n" + link + "\n\n";

                    // Add tweet to storage.
                    storage.push(tweet.id);
                }
            });

            // Resave the json.
            jsonfile.writeFileSync('./tweets-njt.json', storage);

            if (mailOptions.text.trim().length !== 0) {
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        timestamp(error);
                    } else {
                        timestamp("Tweets have been sent");
                    }
                });
            } else {
                timestamp("No tweets to send");
            }
        }).catch( (error) => {
            console.log(error);
        });

    }, 180000);
