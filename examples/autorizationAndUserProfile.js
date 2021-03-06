/**
 * Authorization, oauth profile merging and user profile example.
 */
var hunt = require('./../index.js'),
  profileHelperApi = require('./api/profileHelper.api.js');

var config = {
  //'secret' : 'someLongAndHardStringToMakeHackersSadAndEldersHappy',
  //'port' : 3000,
  //'env' : 'production',
  'hostUrl': 'http://teksi.ru/',
  //'redisUrl' : 'redis://somehost.com:6379',
  //'mongoUrl' : 'mongo://localhost/hunt_dev',
  //'uploadFiles': false, // allow upload of files by HTTP-POST
  //'sessionExpireAfterSeconds':180,
  //'enableMongoose' : true,
  //'enableMongooseUsers' : true,

  'io': {
    'loglevel': 2
  },
  //for password strategies
  'passport': {
    'local': true, //authorization by username/email and password, POST to /auth/login
    'signUpByEmail': true, //user can signup by making POST /auth/signhup with email and password
    'verifyEmail': true, //user have to follow link in email address
    'verifyEmailTemplate': 'email/verifyEmail', //template for verifying email message
    'resetPasswordEmailTemplate': 'email/resetEmail', //template for email used for reseting password
    'resetPasswordPageTemplate': 'cabinet/resetPasswordStage2',
    'resetPassword': true, //allow user to reset password for account

//authorization by gmail account, GET /auth/google
    'google': true,

// Github oAuth strategy, GET /auth/github
    'GITHUB_CLIENT_ID': '1fca293397b695386e24', //obtainable here - https://github.com/settings/applications
    'GITHUB_CLIENT_SECRET': 'SECRETSECRET',

// twitter oAuth strategy, GET /auth/twitter
    'TWITTER_CONSUMER_KEY': 'CrFlQq2QbOPvE4u6Ltg', //obtainable here - https://dev.twitter.com/apps
    'TWITTER_CONSUMER_SECRET': 'SECRETSECRET',

//vk.com oAuth strategy, GET /auth/vk
    'VK_APP_ID': '3058595', //you can get more information here - https://vk.com/dev/native
    'VK_APP_SECRET': 'SECRETSECRET',

//facebook oAuth stragegy, GET /auth/facebook
    'FACEBOOK_CLIENT_ID': '1415057178733225',
    'FACEBOOK_CLIENT_SECRET': 'SECRETSECRET'
  },

  'public': __dirname + '/public', //directory for assets - css, images, client side javascripts
  'views': __dirname + '/views' //directory for templates
//config string of email

  //'emailConfig':false //we use directmail transport
};

var Hunt = hunt(config);

/**
 * Settig up static assets - css and javascripts
 */
Hunt.extendApp(function(core){
  core.app.locals.css.push({'href': '//yandex.st/bootstrap/3.1.1/css/bootstrap.min.css', 'media': 'screen'});
  core.app.locals.javascripts.push({'url': '//yandex.st/jquery/2.0.3/jquery.min.js'});
  core.app.locals.javascripts.push({'url':'//yandex.st/bootstrap/3.1.1/js/bootstrap.min.js'});
  core.app.locals.javascripts.push({'url': '/javascripts/hunt.js'});
});

/**
 * Setting middleware to irritate user who have not verified his account
 */
Hunt.extendMiddleware(function (core) {
  return function (req, res, next) {
    if (req.user) {
      if (req.user.accountVerified) {
        next();
      } else {
        req.flash('error', 'Verify your email address please!');
        next();
      }
    } else {
      next();
    }
  };
});

/**
 *Setting routes
 */
Hunt.extendRoutes(function(core){
  core.app.get('/', function (req, res) {
    if (req.user) {
      res.redirect('/profile');
    } else {
      res.render('cabinet/login', {
        'title': 'Hunt authorization example',
        'description': 'Authorize please!'
      });
    }
  });
});

Hunt.once('dts', console.info); //catching `dts` event`

Hunt.once('start', function () {
  setInterval(function () {
    var now = new Date().toLocaleTimeString();
    Hunt.emit('dts', 'Time now is ' + now); //to be catched by console
    Hunt.emit('broadcast', now); //to be broadcasted by socket.io
  }, 500);
});

/**
 * Starting webserver
 */
Hunt.startWebServer();
