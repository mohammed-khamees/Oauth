const URL = 'https://accounts.google.com/o/oauth2/auth';
const options = {
	client_id:
		'291083127686-1iqh9b0l6hf4hcvoepjp4s07vbmc7573.apps.googleusercontent.com',
	redirect_uri: 'http://localhost:3000/privacy',
	response_type: 'code',
	scope: [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email',
	].join(' '),
};

const queryString = Object.keys(options)
	.map((key) => {
		return `${key}=${encodeURIComponent(options[key])}`;
	})
	.join('&');

console.log('QUERY', queryString);

const authURL = `${URL}?${queryString}`;
const aEl = document.getElementById('oauth');
aEl.setAttribute('href', authURL);
