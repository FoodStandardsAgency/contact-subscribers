const express 			= require('express');
const { check } 		= require('express-validator');
const xss				= require('xss');
const stringify 		= require('csv-stringify')

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
router.get('/',requireLogin, function (req, res) {
	
	res.render('page');
})


//-------------------------------------------------------------------
// PROCESS SUBMISSION
//-------------------------------------------------------------------


	
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
