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
import { ListOrdered } from "lucide-react";

export default function Page() {
  const [base64Text, setBase64Text] = React.useState("");
  const [originalText, setOriginalText] = React.useState("");
  const [base64Error, setBase64Error] = React.useState(false);
  const [originalError, setOriginalError] = React.useState(false);

  const handleBase64Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBase64Text(value);
    setBase64Error(false);

    if (value.trim()) {
      try {
        const decoded = atob(value);
        setOriginalText(decoded);
      } catch {
        setBase64Error(true);
        setOriginalText("Invalid base64 input");
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
        const encoded = btoa(text);
        setBase64Text(encoded);
      } catch {
        setOriginalError(true);
        setBase64Text("Encoding failed");
      }
    } else {
      setBase64Text("");
    }
  };

  return (
    <Card className="w-4/5 h-4/5 overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <ListOrdered />
          <CardTitle>Base64</CardTitle>
        </div>
        <CardDescription>Encode and Decode Base64</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="flex flex-col pt-4 pb-4 gap-8 h-[calc(100%-120px)]">
        <div className="grid grid-cols-2 gap-8 h-full">
          <div className="flex flex-col space-y-1.5 h-full">
            <Label htmlFor="decoded-text">Base64 Text</Label>
            <Textarea
              id="decoded-text"
              className={`h-[calc(100%-28px)] ${base64Error ? 'border-red-500' : ''}`}
              placeholder="Enter base64 to decode"
              value={base64Text}
              onChange={handleBase64Change}
            />
          </div>
          <div className="flex flex-col space-y-1.5 h-full">
            <Label htmlFor="original-text">Original Text</Label>
            <Textarea
              id="original-text"
              className={`h-[calc(100%-28px)] ${originalError ? 'border-red-500' : ''}`}
              placeholder="Enter text to encode to base64"
              value={originalText}
              onChange={handleOriginalTextChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
