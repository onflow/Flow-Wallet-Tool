"use client"

import * as React from "react";
import CryptoJS from 'crypto-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-separator";
import { Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaddingType = keyof typeof CryptoJS.pad;

export default function Page() {
  const [encryptedText, setEncryptedText] = React.useState("");
  const [originalText, setOriginalText] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [iv, setIv] = React.useState("");
  const [aesType, setAesType] = React.useState("AES-256");
  const [padding, setPadding] = React.useState<PaddingType>('Pkcs7');
  const [encryptError, setEncryptError] = React.useState(false);
  const [decryptError, setDecryptError] = React.useState(false);
  const [outputFormat, setOutputFormat] = React.useState("hex");

  const handleEncrypt = React.useCallback((text: string) => {
    if (!text.trim() || !password) {
      setEncryptedText("");
      return;
    }

    try {
      let encrypted;
      const key = CryptoJS.enc.Utf8.parse(password);
      const ivBytes = iv ? CryptoJS.enc.Utf8.parse(iv) : null;

      const options = {
        ...(ivBytes ? { iv: ivBytes } : {}),
        padding: CryptoJS.pad[padding as PaddingType],
        format: {
          stringify: (cipherParams: CryptoJS.lib.CipherParams) => {
            return outputFormat === "base64" 
              ? cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
              : cipherParams.ciphertext.toString(CryptoJS.enc.Hex);
          },
          parse: () => {
            throw new Error("Parsing not implemented");
          }
        }
      };

      switch (aesType) {
        case "AES-128":
          encrypted = CryptoJS.AES.encrypt(text, key.toString().slice(0, 16), options);
          break;
        case "AES-192":
          encrypted = CryptoJS.AES.encrypt(text, key.toString().slice(0, 24), options);
          break;
        default:
          encrypted = CryptoJS.AES.encrypt(text, key, options);
      }

      setEncryptedText(encrypted.toString());
      setEncryptError(false);
    } catch {
      setEncryptError(true);
      setEncryptedText("Encryption failed");
    }
  }, [password, iv, aesType, padding, outputFormat]);

  const handleDecrypt = React.useCallback((encrypted: string) => {
    if (!encrypted.trim() || !password) {
      setOriginalText("");
      return;
    }

    try {
      let decrypted;
      const key = CryptoJS.enc.Utf8.parse(password);
      const ivBytes = iv ? CryptoJS.enc.Utf8.parse(iv) : null;

      const ciphertext = outputFormat === "base64"
        ? CryptoJS.enc.Base64.parse(encrypted)
        : CryptoJS.enc.Hex.parse(encrypted);

      const options = {
        ciphertext: ciphertext
      };

      // Create CipherParams object
      const cipherParams = CryptoJS.lib.CipherParams.create(options);

      switch (aesType) {
        case "AES-128":
          decrypted = CryptoJS.AES.decrypt(cipherParams, key.toString().slice(0, 16), {
            ...(ivBytes ? { iv: ivBytes } : {}),
            padding: CryptoJS.pad[padding as PaddingType]
          });
          break;
        case "AES-192":
          decrypted = CryptoJS.AES.decrypt(cipherParams, key.toString().slice(0, 24), {
            ...(ivBytes ? { iv: ivBytes } : {}),
            padding: CryptoJS.pad[padding as PaddingType]
          });
          break;
        default:
          decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
            ...(ivBytes ? { iv: ivBytes } : {}),
            padding: CryptoJS.pad[padding as PaddingType]
          });
      }

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      setOriginalText(decryptedText);
      setDecryptError(false);
    } catch {
      setDecryptError(true);
      setOriginalText("Decryption failed");
    }
  }, [password, iv, aesType, padding, outputFormat]);

  React.useEffect(() => {
    if (originalText) {
      handleEncrypt(originalText);
    }
  }, [handleEncrypt, originalText, password, iv, aesType, padding, outputFormat]);

  React.useEffect(() => {
    if (encryptedText) {
      handleDecrypt(encryptedText);
    }
  }, [handleDecrypt, encryptedText, password, iv, aesType, padding, outputFormat]);

  const handleEncryptedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEncryptedText(value);
  };

  const handleOriginalTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setOriginalText(text);
  };

  return (
    <Card className="w-4/5 h-4/5 overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <Lock />
          <CardTitle>AES Encryption</CardTitle>
        </div>
        <CardDescription>Encrypt and Decrypt using AES</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="flex flex-col pt-4 pb-4 gap-8 h-[calc(100%-120px)]">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter encryption password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>IV (Optional)</Label>
              <Input
                placeholder="Enter initialization vector"
                value={iv}
                onChange={(e) => setIv(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>AES Type</Label>
              <Select onValueChange={setAesType} defaultValue={aesType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    <SelectItem value="AES-128">AES-128</SelectItem>
                    <SelectItem value="AES-192">AES-192</SelectItem>
                    <SelectItem value="AES-256">AES-256</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Padding</Label>
              <Select onValueChange={(value) => setPadding(value as PaddingType)} defaultValue={padding}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Padding Type</SelectLabel>
                    <SelectItem value="Pkcs7">PKCS7</SelectItem>
                    <SelectItem value="Iso97971">ISO/IEC 9797-1</SelectItem>
                    <SelectItem value="AnsiX923">ANSI X.923</SelectItem>
                    <SelectItem value="Iso10126">ISO 10126</SelectItem>
                    <SelectItem value="ZeroPadding">Zero Padding</SelectItem>
                    <SelectItem value="NoPadding">No Padding</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Output Format</Label>
              <Select onValueChange={setOutputFormat} defaultValue={outputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Format</SelectLabel>
                    <SelectItem value="hex">Hex</SelectItem>
                    <SelectItem value="base64">Base64</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 h-full">
          <div className="flex flex-col space-y-1.5 h-full">
            <Label htmlFor="encrypted-text">Encrypted Text</Label>
            <Textarea
              id="encrypted-text"
              className={`h-[calc(100%-28px)] ${encryptError ? 'border-red-500' : ''}`}
              placeholder="Enter encrypted text to decrypt"
              value={encryptedText}
              onChange={handleEncryptedChange}
            />
          </div>
          <div className="flex flex-col space-y-1.5 h-full">
            <Label htmlFor="original-text">Original Text</Label>
            <div className="relative h-[calc(100%-28px)]">
              <Textarea
                id="original-text"
                className={`h-full ${decryptError ? 'border-red-500' : ''}`}
                placeholder="Enter text to encrypt"
                value={originalText}
                onChange={handleOriginalTextChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}