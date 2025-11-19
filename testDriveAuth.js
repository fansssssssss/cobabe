require('dotenv').config();
const { google } = require('googleapis');

(async () => {
  try {
    // Buat auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    // Buat client Drive
    const drive = google.drive({ version: 'v3', auth });

    // Coba list file 1 buah
    const res = await drive.files.list({ pageSize: 1 });
    console.log('Auth successful:', res.data);
  } catch (err) {
    console.error('Auth failed:', err.response?.data || err);
  }
})();
