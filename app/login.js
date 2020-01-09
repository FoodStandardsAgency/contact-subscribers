const crypto	= require('crypto');

function login(req, res) {
	// Get form data
	const user = req.body.user;
	const password = req.body.password;

	// Hashes
	const prov_hash = crypto.createHash('sha256').update(password).digest('hex').toUpperCase();
	const pass_hash = process.env.PASSCODE
		
	if(pass_hash == prov_hash){
		req.session.user = user;
		req.session.login = 'yes';

		res.redirect('/');
		res.end();
	}
	else {
		req.session.destroy;
		res.redirect('/login');
		res.end();
	}
}

module.exports = login;