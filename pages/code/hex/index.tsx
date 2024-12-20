"use client"

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
import { Binary } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const [hexText, setHexText] = React.useState("");
  const [outputText, setOutputText] = React.useState("");
  const [hexError, setHexError] = React.useState(false);
  const [outputError, setOutputError] = React.useState(false);
  const [outputFormat, setOutputFormat] = React.useState<"base64" | "utf8">("base64");

  const handleHexChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setHexText(value);
    setHexError(false);

    if (value.trim()) {
      try {
        // Convert hex to bytes array
        const bytes = new Uint8Array(
          value.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        
        if (outputFormat === "base64") {
          // Convert bytes to base64
          const base64 = btoa(String.fromCharCode(...bytes));
          setOutputText(base64);
        } else {
          // Convert bytes to UTF-8
          const text = new TextDecoder().decode(bytes);
          setOutputText(text);
        }
      } catch {
        setHexError(true);
        setOutputText("Invalid hex input");
      }
    } else {
      setOutputText("");
    }
  };

  const handleOutputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setOutputText(text);
    setOutputError(false);
    
    if (text.trim()) {
      try {
        let bytes: Uint8Array;
        if (outputFormat === "base64") {
          // Convert base64 to bytes
          const binary = atob(text);
          bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
        } else {
          // Convert UTF-8 string to bytes
          bytes = new TextEncoder().encode(text);
        }
        
        // Convert bytes to hex
        const hex = Array.from(bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        setHexText(hex);
      } catch {
        setOutputError(true);
        setHexText("Encoding failed");
      }
    } else {
      setHexText("");
    }
  };

  const handleFormatChange = (value: "base64" | "utf8") => {
    setOutputFormat(value);
    if (hexText.trim()) {
      try {
        const bytes = new Uint8Array(
          hexText.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        
        if (value === "base64") {
          const base64 = btoa(String.fromCharCode(...bytes));
          setOutputText(base64);
        } else {
          const text = new TextDecoder().decode(bytes);
          setOutputText(text);
        }
      } catch {
        setOutputError(true);
        setOutputText("Conversion failed");
      }
    }
  };

  return (
    <Card className="w-4/5 h-4/5 overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Binary />
            <CardTitle>Hex</CardTitle>
          </div>
          <Select value={outputFormat} onValueChange={handleFormatChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select output format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base64">Base64</SelectItem>
              <SelectItem value="utf8">UTF-8</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>Convert between Hex and {outputFormat === "base64" ? "Base64" : "UTF-8"}</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="flex flex-col pt-4 pb-4 gap-8 h-[calc(100%-120px)]">
        <div className="grid grid-cols-2 gap-8 h-full">
          <div className="flex flex-col space-y-1.5 h-full">
            <Label htmlFor="hex-text">Hex String</Label>
            <Textarea
              id="hex-text"
              className={`h-[calc(100%-28px)] ${hexError ? 'border-red-500' : ''}`}
              placeholder="Enter hex string"
              value={hexText}
              onChange={handleHexChange}
            />
          </div>
          <div className="flex flex-col space-y-1.5 h-full">
            <Label htmlFor="output-text">{outputFormat === "base64" ? "Base64" : "UTF-8"} Text</Label>
            <div className="relative h-[calc(100%-28px)]">
              <Textarea
                id="output-text"
                className={`h-full ${outputError ? 'border-red-500' : ''}`}
                placeholder={`Enter text to convert to hex`}
                value={outputText}
                onChange={handleOutputChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
