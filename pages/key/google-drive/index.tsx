"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { HardDrive, Loader2, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { googleDriveScopes } from "@/utils/constants";
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

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [backupFiles, setBackupFiles] = useState({});
  const searchParams = useSearchParams();
  //   const { toast } = useToast()

  useEffect(() => {
    // Check if auth token exists in cookies
    const token = Cookies.get("google_auth_token");
    if (token) {
      setIsLoggedIn(true);
      searchBackupFiles(token);
    }

    // Handle OAuth callback
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    if (access_token) {
      handleCallback(access_token);
    }
  }, [searchParams]);

  const searchBackupFiles = async (token: string) => {
    try {
      const response = await fetch("/api/googleDrive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });

      if (!response.ok) {
        // throw new Error('Failed to search files');
        console.log("Failed to search files");
        return;
      }

      const data = await response.json();
      console.log("setBackupFiles", data);
      setBackupFiles(data);

      // const keys = Object.keys(data);
      // const decrypted = await Promise.all(
      //   keys.map(async (key) => {
      //     // const encryptedData = JSON.stringify(data[key]);
      //     const encryptedDataStr = data[key];
      //     const parsedData = parseGoogleText(encryptedDataStr);
      //     const decrypted2 = decrypt(parsedData, '4047b6b927bcff0c', '933692f547ffd237')
      //     console.log("decrypted", decrypted2)

      //     if (parsedData !== data[key]) {
      //       console.error("DIFF", {
      //         parsedData,
      //         data: data[key],
      //       });
      //     } else {
      //       console.log("SAME")
      //     }

      //     const decrypted = await fetch("/api/backupAES", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({ data: parsedData }),
      //     });

      //     const decryptedData = await decrypted.json();
      //     // const decryptedDataStr = JSON.parse(decryptedData.data) || decryptedData;
      //     return { [key]: decryptedData };
      //   })
      // );

      // console.log("decryptedData", decrypted);
      setBackupFiles(data);
    } catch (error) {
      console.error("Error searching backup files:", error);
    }
  };

  const handleCallback = async (access_token: string) => {
    setLoading(true);
    try {
      // Store the access token
      Cookies.set("google_auth_token", access_token);
      setIsLoggedIn(true);
      await searchBackupFiles(access_token);
      // Close the popup if this page was opened in one
      if (window.opener) {
        window.opener.location.reload();
        window.close();
      }
    } catch (error) {
      console.error("Error handling callback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("google_auth_token");
    setIsLoggedIn(false);
    setBackupFiles({});
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Google OAuth2 configuration
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

      // Google OAuth2 scopes for Drive API
      const scope = encodeURIComponent(googleDriveScopes.join(" "));

      // Construct OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;

      // Open Google login in new tab
      window.open(authUrl, "_blank");
    } catch (error) {
      console.error("Google OAuth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async () => {
    const token = Cookies.get("google_auth_token");
    if (token) {
      await searchBackupFiles(token);
    }
  };

  return (
    <Card className="min-w-[350px] max-w-[650px] overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive />
            <CardTitle>Google Drive</CardTitle>
          </div>
          {isLoggedIn && (
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          )}
        </div>
        <CardDescription>Import FRW account from google drive</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4 items-center justify-center flex flex-col gap-2">
        <Image src="/logo.png" alt="logo" width={64} height={64} />
        <h4 className="text-lg font-medium">Flow Wallet</h4>
        <p className="text-sm text-muted-foreground">
          Inspect FRW account from google drive
        </p>

        {isLoggedIn ? (
          <>
            <Button
              variant="default"
              className="w-full"
              onClick={handleInspect}
            >
              <Search className="mr-2 h-4 w-4" />
              Lookup Backups
            </Button>
          </>
        ) : (
          <Button className="mt-4" onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Connect with Google Drive
          </Button>
        )}
      </CardContent>

      {backupFiles && (
        <>
          <Separator className="bg-border h-px w-full" />
          <CardFooter className="flex flex-col items-center justify-center gap-4">
            {Object.keys(backupFiles).map((key) => (
              <Card key={key} className="w-full">
                <CardHeader>
                  <CardTitle className="text-sm">{key}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {backupFiles[key]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
