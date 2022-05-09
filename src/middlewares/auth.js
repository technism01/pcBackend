const jwt = require('jsonwebtoken');

module.exports.isLoggedIn = (req, res, next) => {
	if (process.env.NODE_ENV === 'testing') {

		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (!token) return res.status(401).json({ "msg": "Access Denied" });

		try {
			const verified = jwt.verify(token, process.env.JWT_SECRET);
			req.user = verified;
		} catch (err) {
			return res.status(400).json({ "error": "TOKEN IS EXPIRED OR INVALID" });
		}
	}
	next();
};
