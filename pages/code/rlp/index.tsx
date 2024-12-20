"use client"

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-separator";
import { TextIcon } from "lucide-react";
import { encode, decode } from 'rlp';
import { arrToStringArr} from "@/lib/rlp";

export default function Page() {
  const [rlpText, setRlpText] = React.useState("");
  const [originalText, setOriginalText] = React.useState("");
  const [rlpError, setRlpError] = React.useState(false);
  const [originalError, setOriginalError] = React.useState(false);

  const handleRlpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRlpText(value);
    setRlpError(false);

    if (value.trim()) {
      try {
        // Convert hex string to Buffer
        const buffer = Buffer.from(value.replace('0x', ''), 'hex');
        const decoded = decode(buffer);
        const decodedArr = arrToStringArr(decoded as Uint8Array[]);
        console.log(JSON.stringify(decodedArr));
        // Convert decoded Buffer to string
        setOriginalText(JSON.stringify(decodedArr, null, 2));
      } catch {
        setRlpError(true);
        setOriginalText("Invalid RLP input");
      }
    } else {
      setOriginalText("");
    }
  };

  const handleOriginalTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setOriginalText(text);
    setOriginalError(false);
    
    if (text.trim()) {
      try {
        // Parse JSON string to array
        const arr = JSON.parse(text);
        // Convert hex strings to Buffers
        const buffers = arr.map((hex: string) => Buffer.from(hex.replace('0x', ''), 'hex'));
        const encoded = encode(buffers);
        const encodedHex = Buffer.from(encoded).toString('hex');
        // Convert encoded Buffer to hex string
        setRlpText('0x' + encodedHex);
      } catch {
        setOriginalError(true);
        setRlpText("Encoding failed");
      }
    } else {
      setRlpText("");
    }
  };

  return (
    <Card className="w-4/5 h-4/5 overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TextIcon />
          <CardTitle>RLP</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="transaction-mode">Transaction</Label>
          <Switch 
            id="transaction-mode" 
            onCheckedChange={(checked) => {
              if (checked) {
                window.location.href = "/code/rlpTx";
              }
            }}
          />
        </div>
        </div>
        <CardDescription>Encode and Decode RLP (Recursive Length Prefix)</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="flex flex-col pt-4 pb-4 gap-8 h-[calc(100%-120px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          <div className="flex flex-col space-y-1.5 h-full">
            <Label htmlFor="decoded-text">RLP Encoded (Hex)</Label>
            <Textarea
              id="decoded-text"
              className={`h-[calc(100%-28px)] ${rlpError ? 'border-red-500' : ''}`}
              placeholder="Enter RLP encoded hex string to decode"
              value={rlpText}
              onChange={handleRlpChange}
            />
          </div>
          <div className="flex flex-col space-y-1.5 h-full">
            <Label htmlFor="original-text">Original Text</Label>
            <div className="relative h-[calc(100%-28px)]">
              <Textarea
                id="original-text"
                className={`h-full ${originalError ? 'border-red-500' : ''}`}
                placeholder="Enter text to encode to RLP"
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
