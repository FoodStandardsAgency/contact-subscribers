const crypto	= require('crypto');

function login(req, res) {
	// Get form data
	const user = req.body.user;
	const password = req.body.password;

	// Hashes
	const prov_hash = crypto.createHash('sha256').update(password).digest('hex')
	const pass_hash = process.env.PASSCODE
	const user_env = process.env.USERNAME
		
	if(pass_hash == prov_hash && user == user_env ){
		req.session.user = user;
		req.session.login = 'yes';
		
		console.log("Login details accepted");
		
		res.redirect('/');
		res.end();
	}
	else {
		console.log("Login details removed");
		
		req.session.destroy;
		res.redirect('/login');
		res.end();
	}
}

module.exports = login;