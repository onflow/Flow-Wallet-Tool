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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { generateSeedPhrase } from "@/lib/key";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Page() {
  const [loading, setLoading] = React.useState(false);
  const [seedPhrase, setSeedPhrase] = React.useState("");
  const [keyType, setKeyType] = React.useState("sp");
  const [passphrase, setPassphrase] = React.useState("");
  const [derivationPath, setDerivationPath] = React.useState("m/44'/539'/0'/0/0");

  const handleGenerate = async () => {
    if (keyType !== "sp") return;

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
          <CardTitle>Key Generate</CardTitle>
        </div>
        <CardDescription>Generate All Types of Key for Flow Account</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        <Label htmlFor="key-type mb-2">Key Type</Label>
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

        <div className="flex flex-col gap-2 mt-4">
        <Label htmlFor="key-type">Config</Label>
        {keyType === "sp" && (

          <div className="flex flex-col gap-2 border rounded-md p-2 items-start ">
            <div className="flex gap-2 w-full">
            <Input placeholder="Derivation Path" className="grow" value={derivationPath} onChange={(e) => setDerivationPath(e.target.value)} />
              <ToggleGroup type="single" defaultValue="128">
                <ToggleGroupItem value="128">12</ToggleGroupItem>
                <ToggleGroupItem value="160">15</ToggleGroupItem>
                <ToggleGroupItem value="256">24</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <Input placeholder="Passphrase (Optional)" className="grow" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
          </div>

        )}

        {keyType === "pk" && (
            <div className="flex gap-2 border rounded-md p-2 items-center w-full">
              <p className="text-sm font-medium text-muted-foreground">Curve</p>
              <ToggleGroup type="single" defaultValue="P256" className="grow justify-end" variant="outline">
                <ToggleGroupItem value="P256">P256</ToggleGroupItem>
                <ToggleGroupItem value="secp256k1">secp256k1</ToggleGroupItem>
              </ToggleGroup>
            </div>
        )}
        </div>

      </CardContent>
      <div>
        <Separator className="bg-border h-px" />
        <CardFooter className="flex justify-between">{seedPhrase}</CardFooter>
      </div>
    </Card>
  );
}
