import { google } from "googleapis";

export const fetchAppDataFolder = async (token: string) => {
  // Create new OAuth2 client with access token
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  // Create drive client with auth
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  // List files in app folder
  const response = await drive.files.list({
    spaces: "appDataFolder",
    fields: "files(id, name)",
  });

  console.log(response.data);

  const files = response.data.files;
  const result: Record<string, string | null> = {};

  // Get content of found files
  if (files && files.length > 0) {
    await Promise.all(
      files.map(async (file) => {
        if (file.name && file.id) {
          const content = await drive.files.get({
            fileId: file.id,
            alt: "media",
          });
          result[file.name] = content.data as string;
        }
      })
    );
  }

  return result;
};
