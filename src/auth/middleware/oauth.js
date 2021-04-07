'use strict';

require('dotenv').config();
const superagent = require('superagent');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
const User = require('./../models/users');

const tokenServerUrl = 'https://oauth2.googleapis.com/token';
const remoteAPI = 'https://accounts.google.com/o/oauth2/auth';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

function getGoogleAuthURL() {
	const options = {
		redirect_uri: REDIRECT_URI,
		client_id: CLIENT_ID,
		access_type: 'offline',
		response_type: 'code',
		prompt: 'consent',
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email',
		].join(' '),
	};

	return `${remoteAPI}?${querystring.stringify(options)}`;
}

async function getTokens(objData) {
	const code = objData.code;
	const clientId = objData.clientId;
	const clientSecret = objData.clientSecret;
	const redirectUri = objData.redirectUri;

	const values = {
		code: code,
		client_id: clientId,
		client_secret: clientSecret,
		redirect_uri: redirectUri,
		grant_type: 'authorization_code',
	};

	try {
		const token = await superagent
			.post(tokenServerUrl)
			.send(querystring.stringify(values))
			.set('Content-Type', 'application/x-www-form-urlencoded');

		return token.body;
	} catch (error) {
		throw new Error(error.message);
	}
}

//remoteToken
async function exchangeCodeForToken(code) {
	const { id_token, access_token } = await getTokens({
		code,
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		redirectUri: REDIRECT_URI,
	});

	try {
		const googleUser = await superagent
			.get(
				`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
			)
			.set('Authorization', `Bearer ${id_token}`);

		const token = jwt.sign(googleUser.body.name, process.env.SECRET);

		return token, googleUser.body;
	} catch (error) {
		throw new Error(error.message);
	}
}

async function getUser(remoteUser) {
	const userRecord = {
		username: remoteUser.name,
		password: 'oauthpassword',
	};
	const user = new User(userRecord);
	const userDoc = await user.save();

	console.log('__USERDOC__', userDoc);

	const token = userDoc.token;

	return [user, token];
}

module.exports = async (req, res, next) => {
	try {
		const code = req.query.code;
		const remoteUser = await exchangeCodeForToken(code);
		const [user, token] = await getUser(remoteUser);
		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		throw new Error(error.message);
	}
};
