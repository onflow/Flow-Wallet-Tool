"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-separator";
import { Hash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sha3_256, keccak256 } from "js-sha3";
import { createHash } from "crypto";

export default function Page() {
  const [inputText, setInputText] = React.useState("");
  const [hashText, setHashText] = React.useState("");
  const [hashType, setHashType] = React.useState("SHA256");

  const calculateHash = (text: string, type: string) => {
    if (!text.trim()) {
      setHashText("");
      return;
    }

    try {
      switch (type) {
        case "SHA256":
          setHashText(createSha256Hash(text));
          break;
        case "SHA3-256":
          setHashText(createSha3_256Hash(text));
          break;
        case "KECCAK256":
          setHashText(createKeccak256Hash(text));
          break;
      }
    } catch (error) {
      console.error("Hashing failed:", error);
      setHashText("Hashing failed");
    }
  };

  const createKeccak256Hash = (text: string) => {
    return keccak256(text);
  };

  const createSha256Hash = (text: string) => {
    const hash = createHash("sha256").update(text).digest("hex");
    return hash;
  };

  const createSha3_256Hash = (text: string) => {
    const hash = sha3_256(text);
    return hash;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    calculateHash(text, hashType);
  };

  return (
    <Card className="w-3/5 overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Hash />
            <CardTitle>Hash Generator</CardTitle>
          </div>
          <Select
            value={hashType}
            onValueChange={(value) => {
              setHashType(value);
              calculateHash(inputText, value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select hash type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SHA256">SHA256</SelectItem>
              <SelectItem value="SHA3-256">SHA3-256</SelectItem>
              <SelectItem value="KECCAK256">Keccak256</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>Generate cryptographic hashes</CardDescription>
      </CardHeader>

      <Separator className="bg-border h-px" />
      <CardContent className="flex flex-col pt-4 pb-4 gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="input-text">Input Text</Label>
            <Textarea
              id="input-text"
              className="h-[200px]"
              placeholder="Enter text to hash"
              value={inputText}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="hash-text">Hash Output</Label>
            <Textarea
              id="hash-text"
              className="h-[200px]"
              placeholder="Hash output"
              value={hashText}
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
