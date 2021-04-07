'use strict';

// All middleware has access to the request.
// Here, we're simply logging out the interesting parts
const logger = (req, res, next) => {
	try {
		console.log('REQUEST:', req.method, req.path);

		// Call next() so that the next function in line can do it's work
		next();
	} catch (error) {
		console.log('error:', error.message);
	}
};

module.exports = logger;
