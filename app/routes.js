const express 			= require('express');
const xss				= require('xss');
const csvParser 		= require('csv-parser');
const fs 				= require('fs');

const NotifyClient 		= require('notifications-node-client').NotifyClient

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
router.get('/', function (req, res) {res.render('page');})

//-------------------------------------------------------------------
// PROCESS SUBMISSION
//-------------------------------------------------------------------

router.post('/subs-send', function(req,res) {
	
	// Function to send Email through notify
	function send_email(subject, message, email) {notifyClient
	  .sendEmail(process.env.TEMPLATE_ID, email , {
		personalisation: {
			'subject': subject,
			'message': message
		},
		reference: reference
	  })
	  .then(response => (console.log("Processed")))
	  .catch(err => console.error(err))}
	
	// Function to read in email addressses from the file and send emails
	function read_file_send_email(subject, message, reference, file) {
	fs.createReadStream(file)
    .pipe(csvParser({headers:['Email']}))
    .on('data', (row) => {
		var email = row['Email'].trim()
		send_email(subject, message , email);
    })
	.on('end', () => {
        console.log("End of file")
		res.render('page', {"message":"y"})
		res.end;
		
		})}
	
	// Get submission values
	var subject = req.fields.subject;
	var message = req.fields.message;
	
	var file	= req.files.list.path;
	
	// Generate notification batch ID
	var reference = 'refrence';
	
	// Initialise Notify client
	var notifyClient = new NotifyClient(process.env.TEST_KEY)
	
	read_file_send_email(subject, message, reference, file);
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
