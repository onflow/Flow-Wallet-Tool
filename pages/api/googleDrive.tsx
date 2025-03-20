import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import aesjs from 'aes-js';

const pad_array = (arr: Uint8Array, len = 16, fill = 0) => {
  const padded = new Uint8Array(len);
  padded.fill(fill);
  arr.forEach((value, index) => {
    if (index < len) padded[index] = value;
  });
  return padded;
};

const decrypt = (encryptedHex: string, password: string, iv: string): string => {
  // The initialization key (must be 16 bytes)
  const key = pad_array(aesjs.utils.utf8.toBytes(password));
  // When ready to decrypt the hex string, convert it back to bytes
  const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
  // console.log('encryptedBytes ->', encryptedBytes)
  // The cipher-block chaining mode of operation maintains internal
  // state, so to decrypt a new instance must be instantiated.
  const aesCbc = new aesjs.ModeOfOperation.cbc(key, aesjs.utils.utf8.toBytes(iv));
  const decryptedBytes = aesjs.padding.pkcs7.strip(aesCbc.decrypt(encryptedBytes));
  // console.log('decryptedBytes ->', decryptedBytes)
  // Convert our bytes back into text
  const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  return decryptedText.trim();
};

const parseGoogleText = (encryptedData: string) => {
  let encryptedHex;

  // Attempt to parse the data as JSON
  try {
    const sanitizedData = encryptedData.replace(/\s+/g, "");
    console.log("sanitizedData ->", sanitizedData)
    const parsedData = JSON.parse(sanitizedData);
    encryptedHex = parsedData?.hex || parsedData;
  } catch (error) {
    console.warn("JSON parsing failed, checking if raw hex string:", error);

    const rawHex = encryptedData.replace(/\s+/g, "");
    if (/^[0-9a-fA-F]+$/.test(rawHex)) {
      encryptedHex = rawHex;
    } else {
      throw new Error("Invalid input: not JSON and not a valid hex string");
    }
  }
  return encryptedHex;
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.body;

  try {
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

    const files = response.data.files;
    const result: Record<string, any | null> = {};

    // Get content of found files
    if (files && files.length > 0) {
      await Promise.all(
        files.map(async (file) => {
          if (file.name && file.id) {
            const content = await drive.files.get({
              fileId: file.id,
              alt: "media",
            });

            const text = Buffer.from(content.data).toString('utf-8').trim();
            const sanitizedText = text.replace("/", "")
            const decrypted2 = decrypt(sanitizedText, '4047b6b927bcff0c', '933692f547ffd237')
            result[file.name] = {data: sanitizedText, decrypted: decrypted2};
            // console.log("content ==>");
            // console.log(content.data);

            // const params = { alt: 'media' }

            // const init = {
            //   method: 'GET',
            //   async: true,
            //   headers: {
            //     Authorization: 'Bearer ' + token,
            //     Accept: '*/*',
            //   },
            //   // contentType: 'application/json',
            // };
        
            // const requestURL = 'https://www.googleapis.com/' + `drive/v3/files/${file.id}/` + '?' + new URLSearchParams(params).toString();

            // const response = await fetch(requestURL, init);
            // const text = await response.text();
            // const parsedText = parseGoogleText(text);
            // const decrypted2 = decrypt(parsedText, '4047b6b927bcff0c', '933692f547ffd237')
            // result[file.name] = 
            // = {data: parsedText, decrypted: decrypted2};
          }
        })
      );
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Google Drive API Error:", error);
    return res.status(401).json({
      error: "Invalid Credentials",
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch from Google Drive",
    });
  }
}
