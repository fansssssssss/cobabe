// drive.js
const { google } = require("googleapis");
const stream = require("stream");

/**
 * Initialize Google Drive API with OAuth2 user flow
 */
const getDriveClient = () => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
      throw new Error("Missing Google OAuth environment variables (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)");
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    return google.drive({ version: "v3", auth: oAuth2Client });
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
