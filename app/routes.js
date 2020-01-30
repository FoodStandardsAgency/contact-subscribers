const express 			= require('express');
const { check } 		= require('express-validator');
const xss				= require('xss');
const csvParser 		= require('csv-parser');
const fs 				= require('fs');
const crypto			= require('crypto');
const NotifyClient 		= require('notifications-node-client').NotifyClient

const router 			= express.Router();

// Add timestamps to logs
require('log-timestamp');
console.log("User entry (timestamp 1hr behind)");

// Redirect not logged in users to the login page
function requireLogin (req, res, next) {
	console.log("Log-in"); 
	console.log(req.session.user); 
	
	if (req.session.login != 'yes') {
		console.log("login undefined - redirecting"); 
		req.session.destroy(); 
		res.redirect('/login');
	} else {next();}
};

//-------------------------------------------------------------------
// LOGIN PAGE
//-------------------------------------------------------------------

router.get ('/login', function (req, res) {res.render("login");});
router.post('/login',[check('user').escape()], function (req, res) { 

	// Get form data
	const user = req.fields.user;
	const password = req.fields.password;

	// Hashes
	const prov_hash = crypto.createHash('sha256').update(password).digest('hex')
	const pass_hash = process.env.PASSCODE
	const user_env = process.env.UNAME
	
	if(pass_hash == prov_hash && user == user_env ){
		req.session.user = user;
		req.session.login = 'yes';
		
		console.log("Login details accepted");
		
		res.redirect('/');
		res.end();
	}
	else {
		console.log("Login details rejected");
		
		req.session.destroy;
		res.redirect('/login');
		res.end();
	} 
});

router.get('/log-out', (req, res) => {
	
	// Destroy session and log out
	req.session.destroy();
	res.writeHead(302, {'Location': '/login'});
	res.end();
});



//-------------------------------------------------------------------
// APP PAGES
//-------------------------------------------------------------------
router.get('/',requireLogin, function (req, res) {res.render('page');})

//-------------------------------------------------------------------
// PROCESS SUBMISSION
//-------------------------------------------------------------------

router.post('/subs-send',requireLogin, function(req,res) {
	
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
