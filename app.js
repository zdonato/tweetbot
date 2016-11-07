var Twitter = require('twitter');
var nodemailer = require('nodemailer');
var emailInfo = require('./emailInfo');

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

getTweets("grimmales",["soon", "release", "tickets", "rainbow dome", "new", "tapped"])
    .then( (tweets) => {
        var mailOptions = {
            from: 'Zacharydonato.com <zdonatowebsiteform@gmail.com>',
            to: 'd3a4gf7@gmail.com',
            subject: "Here's the tweets you requested",
            text: ''
        };

        tweets.forEach( (tweet) => {

            var link = "https://twitter.com/GrimmAles/status/" + tweet.id;

            var params = {
                id: tweet.id,
                trim_user: true
            };

            mailOptions.text += tweet.text + "\n" + link + "\n\n";
        });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log(info);
            }
        });
    })
    .catch( (error) => {
        console.log(error);
    });
