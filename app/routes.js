const express 			= require('express');
const { check } 		= require('express-validator');
const xss				= require('xss');
const csv 				= require('csv-array');

const NotifyClient = require('notifications-node-client').NotifyClient

// Custom modules
const router 			= express.Router();

// Add timestamps to logs
require('log-timestamp');
console.log("User entry (timestamp 1hr behind)");

// Redirect not logged in users to the login page
function requireLogin (req, res, next) {console.log("Login"); console.log(req.session.user); console.log(req.session.group); if (req.session.login == undefined) {console.log("login undefined - redirecting"); req.session.destroy(); 
res.redirect('/login');} else {next();}};

//-------------------------------------------------------------------
// LOGIN PAGE
//-------------------------------------------------------------------

router.get ('/login', function (req, res) {res.render("login");});
router.post('/login', [check('user').escape()], function (req, res) { login(req, res); });

router.get('/log-out', (req, res) => {
	
	// Destroy session and log out
	req.session.destroy();
	res.writeHead(302, {'Location': '/login'});
	res.end();
});



//-------------------------------------------------------------------
// APP PAGES
//-------------------------------------------------------------------
router.get('/', function (req, res) {
	
	res.render('page');
})


//-------------------------------------------------------------------
// PROCESS SUBMISSION
//-------------------------------------------------------------------

router.post('/subs-send', function(req,res) {
	
	// Get submission values
	var subject = req.body.subject;
	var message = req.body.message;
	
	// Delete all files in tmp directory
	
	
	// Generate notification batch ID
	var reference = 'refrence';
	
	// Initialise Notify client
	var notifyClient = new NotifyClient(process.env.TEST_KEY)
	
	// Rename file currently in tmp directory
	//console.log(req.files.list.path);
	
	// Translate CSV into an array
	csv.parseCSV(req.files.list.path, function(data){
		
		var emails_batch = JSON.stringify(data);
		
		console.log(emails_batch.length);
		console.log(emails_batch);
		// Loop to send emails
		/*for (i = 0; emails_batch.length; i++) {
			console.log(emails_batch[i]);
		}*/

	}, false);
	

	
	/*
	notifyClient
	  .sendEmail('03a5ef32-b1c3-4c13-bef2-d6086f355d99', ['anna.nikiel@food.gov.uk', 'anna@limeco.org'], {
		personalisation: {
			'subject': subject,
			'message': message
		},
		reference: reference
	  })
	  .then(response => console.log(response))
	  .catch(err => console.error(err))
	 */
	
});
	
//-------------------------------------------------------------------
// Error handling
//-------------------------------------------------------------------

/*Handle 404s*/
router.use(function (req, res, next) {
  res.status(404).render('error_page', {"message":"Requested page does not exist."})
})

router.use(function (req, res, next) {
  res.status(500).render('error_page', {"message":"Something went wrong."})
})


//-------------------------------------------------------------------
// Export router
//-------------------------------------------------------------------

module.exports = router;
