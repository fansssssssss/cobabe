// getRefreshToken.js
const { google } = require('googleapis');
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // misal: http://localhost:5000/oauth2callback
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function main() {
  try {
    // Generate login URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline', // wajib, biar dapat refresh token
      scope: SCOPES,
      prompt: 'consent', // pastikan selalu muncul consent screen
    });

    console.log('1️⃣ Visit this URL in your browser:');
    console.log(authUrl);
    console.log('\n2️⃣ After login, copy the "code" query param from the redirect URL.');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('\nEnter the code here: ', async (code) => {
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        console.log('\n✅ Here is your refresh token:');
        console.log(tokens.refresh_token);
        console.log('\n💡 Save it in your .env as GOOGLE_REFRESH_TOKEN');
        readline.close();
      } catch (err) {
        console.error('Error retrieving access token', err);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

main();
