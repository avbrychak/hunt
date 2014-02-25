/*
 * Full example, user authorization, REST interface for trophies,
 * socket.io notifications, dialog system
 */

var hunt = require('./../index.js'),
  dialogHelperApi = require('./api/dialogHelper.api.js'),
  profileHelperApi = require('./api/profileHelper.api.js');

var config = {
  //'secret' : 'someLongAndHardStringToMakeHackersSadAndEldersHappy', //populated from environment
  //'port' : 3000,
  //'env' : 'production',
  //'hostUrl': 'http://teksi.ru/', //populated from environment
  //'redisUrl' : 'redis://somehost.com:6379',
  //'mongoUrl' : 'mongo://localhost/hunt_dev',
  //'uploadFiles': false, // do not allow upload of files by HTTP-POST
  //'enableMongoose' : true,
  //'enableMongooseUsers' : true,

  'io': {
    'loglevel': 2
  },
  //for password strategies
  'passport': {
//    'sessionExpireAfterSeconds':180,
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
//populated from enviroment values
//    'GITHUB_CLIENT_ID': '1fca293397b695386e24', //obtainable here - https://github.com/settings/applications
//    'GITHUB_CLIENT_SECRET': 'SECRETSECRET',

// twitter oAuth strategy, GET /auth/twitter
// populated from enviroment values
//    'TWITTER_CONSUMER_KEY': 'CrFlQq2QbOPvE4u6Ltg', //obtainable here - https://dev.twitter.com/apps
//    'TWITTER_CONSUMER_SECRET': 'SECRETSECRET',

//vk.com oAuth strategy, GET /auth/vk
// populated from enviroment values
//    'VK_APP_ID': '3058595', //you can get more information here - https://vk.com/dev/native
//    'VK_APP_SECRET': 'SECRETSECRET',

//facebook oAuth stragegy, GET /auth/facebook
// populated from enviroment values
//    'FACEBOOK_CLIENT_ID': '1415057178733225',
//    'FACEBOOK_CLIENT_SECRET': 'SECRETSECRET'
  },
  'io': {
    'loglevel': 2
  },
  'dialog': true,//enable dialogs api on /api/dialog
  'public': __dirname + '/public', //directory for assets - css, images, client side javascripts
  'views': __dirname + '/views' //directory for templates

  //'emailConfig':false //we use directmail transport
};

var Hunt = hunt(config);

/*
 * Settig up static assets - css and javascripts
 */
Hunt.extendApp(function (core) {
  core.app.locals.menu=[
    {'url':'/trophies','name':'Trophies'},
    {'url':'/new','name':'Create new trophy'}
  ];
  core.app.locals.css.push({'href': '/css/style.css', 'media': 'screen'});
  core.app.locals.javascripts.push({'url': '//yandex.st/jquery/2.0.3/jquery.min.js'});
  core.app.locals.javascripts.push({'url': '/javascripts/dialog.js'});
});

/*
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

/*
 * Setting some shared routes
 */
Hunt.extendRoutes(dialogHelperApi);
Hunt.extendRoutes(profileHelperApi);

/*
 * Setting custom routes
 */
Hunt.extendRoutes(function(core){

  core.app.get('/', function(req, res){
    res.send('ok');
  });

  core.app.get('/online', function (req, res) {
    res.locals.javascripts.push({'url': '/javascripts/online.js'});
    res.render('online', {
      'title': 'Hunt socket.io and users online example',
      'description': 'This is a list of currently online clients'
    });
  });

/*
 * Setting up api endpoind to trophies
 * https://github.com/visionmedia/express-resource
 */
  core.app.resource('trophies',require('./api/trophy.api.js'));
});

/*
 * setting up the event handlers
 */

Hunt.on('httpSuccess', function(httpSuccess){
  //event that is emmited on any successefull http request processed
  Hunt.emit('broadcast', httpEvent);
});

Hunt.on('httpError', function(err){
  console.error(err);
//also we notify admin that there is some sort of error
//by default it is done by direct mail transport, so it will work alwayes,
//but the message will likely be marked as spam
  Hunt.sendEmail('support@example.com',
    'Our application did a bad bad thing!',
    JSON.stringify(err.stack),
    console.error);
});


/*
 * Starting cluster of webserveres
 * We start 2 worker processes and 1 master process
 * We listen to port 3000
 */

//Hunt.startWebCluster(3,3000);
/*
 *But let us Hunt to decide
 *how many worker process is spawned (1 for every CPU core present)
 *and what port to use (from config or process.env.port or default - 3000)
 */
Hunt.startWebCluster();
