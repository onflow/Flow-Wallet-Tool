import type { NextApiRequest, NextApiResponse } from "next";
import CryptoJS from "crypto-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: "No data provided" });
  }

  try {
    // Get encryption key and IV from environment variables
    const key = process.env.ENCRYPTION_KEY;
    const iv = process.env.ENCRYPTION_IV;

    if (!key || !iv) {
      return res.status(500).json({ error: "Encryption credentials not configured" });
    }

    // Parse the hex string to CipherParams
    const ciphertext = CryptoJS.enc.Hex.parse(data);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext
    });

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse(iv),
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    // Convert to UTF8 string
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    return res.status(200).json({ data: decryptedStr });

  } catch (error) {
    console.error("Decryption error:", error);
    return res.status(500).json({ 
      error: "Decryption failed",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}
