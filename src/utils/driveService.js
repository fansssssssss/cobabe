const { google } = require("googleapis");
const stream = require("stream");

/**
 * Initialize Google Drive API from ENV JSON
 */
const getDriveClient = () => {
  try {
    
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').trim(), // Important: replace \\n with actual newlines
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_IDD,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com"
    };

    // Validate required fields
    if (!credentials.private_key || !credentials.client_email) {
      throw new Error("Missing required Google Drive credentials");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.file"]
    });

    return google.drive({ version: "v3", auth });
  } catch (error) {
    console.error("Error initializing Google Drive client:", error);
    throw error;
  }
};

/**
 * Upload file to Google Drive
 */
const uploadToDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    if (!fileBuffer) throw new Error("File buffer is empty");
    if (!fileName) throw new Error("File name is required");

    const drive = getDriveClient();

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
      name: fileName,
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined,
    };

    const media = { mimeType, body: bufferStream };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    return {
      id: response.data.id,
      fileName: response.data.name,
      viewLink: response.data.webViewLink,
      downloadLink:
        response.data.webContentLink || `https://drive.google.com/uc?export=download&id=${response.data.id}`,
    };
  } catch (error) {
    console.error("Upload to Google Drive failed:", error);
    throw error;
  }
};

/**
 * Delete file from Google Drive
 */
const deleteFromDrive = async (fileId) => {
  if (!fileId) return;

  try {
    const drive = getDriveClient();
    await drive.files.delete({ fileId });
    console.log("File deleted:", fileId);
  } catch (error) {
    console.error("Failed to delete file from Google Drive:", error.message);
  }
};

module.exports = { uploadToDrive, deleteFromDrive };
