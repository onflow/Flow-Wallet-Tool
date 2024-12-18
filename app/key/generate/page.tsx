"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSeedPhrase } from "@/lib/key";

export default function Page() {
  const [loading, setLoading] = React.useState(false);
  const [seedPhrase, setSeedPhrase] = React.useState("");
  const [keyType, setKeyType] = React.useState("sp");

  const handleGenerate = async () => {
    // if (keyType !== "sp") return;

    setLoading(true);
    try {
      const phrase = await generateSeedPhrase();
      setSeedPhrase(phrase);
    } catch (error) {
      console.error("Error generating seed phrase:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="min-w-[450px] max-w-[650px overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <Plus />
          <CardTitle>Generate</CardTitle>
        </div>
        <CardDescription>Generate Key for Flow Account</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        <div className="flex gap-2">
          <Select onValueChange={setKeyType} defaultValue="sp">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seed Phrase" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Key Type</SelectLabel>
                <SelectItem value="sp">Seed Phrase</SelectItem>
                <SelectItem value="pk">Private Key</SelectItem>
                <SelectItem value="ks">KeyStore</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            className="w-[150px]"
            onClick={handleGenerate}
            disabled={loading}
          >
            {/* {loading ? <Loader2 className="animate-spin" /> : ""} */}
            Generate
          </Button>
        </div>
      </CardContent>
      <div>
        <Separator className="bg-border h-px" />
        <CardFooter className="flex justify-between">{seedPhrase}</CardFooter>
      </div>
    </Card>
  );
}
