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
import { Copy, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  generatePrivateKey,
  generateSeedPhrase,
  pk2PubKey,
  seed2PubKey,
} from "@/lib/key-tool";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CopyableText } from "@/components/copyable-text";
import { KeyInfoCard } from "@/components/key-info-card";

export default function Page() {
  const [loading, setLoading] = React.useState(false);
  const [seedPhrase, setSeedPhrase] = React.useState("");
  const [pk, setPK] = React.useState("");
  const [keyType, setKeyType] = React.useState("sp");
  const [passphrase, setPassphrase] = React.useState("");
  const [derivationPath, setDerivationPath] =
    React.useState("m/44'/539'/0'/0/0");
  const [bitLength, setBitLength] = React.useState("128");
  const [pubKeys, setPubKeys] = React.useState<{
    P256: { pubK: string; pk: string };
    SECP256K1: { pubK: string; pk: string };
  } | null>(null);

  const handleGenerate = async () => {
    if (keyType === "sp") {
      setPK("");
      handleSeedPhraseGenerate();
    } else if (keyType === "pk") {
      setSeedPhrase("");
      handlePrivateKeyGenerate();
    }
  };

  const handleSeedPhraseGenerate = async () => {
    try {
      const bitLengthNumber = Number(bitLength);
      const phrase = await generateSeedPhrase(bitLengthNumber, passphrase);
      const pubKey = await seed2PubKey(phrase);
      setSeedPhrase(phrase);
      setPubKeys(pubKey);
    } catch (error) {
      console.error("Error generating seed phrase:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivateKeyGenerate = async () => {
    try {
      const pk = await generatePrivateKey();
      setPK(pk);
      const pubKey = await pk2PubKey(pk);
      setPubKeys(pubKey);
    } catch (error) {
      console.error("Error generating private key:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="min-w-[350px] max-w-[650px] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <Plus />
          <CardTitle>Key Generate</CardTitle>
        </div>
        <CardDescription>
          Generate All Types of Key for Flow Account
        </CardDescription>
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

        {keyType === "sp" && (
        <div className="flex flex-col gap-2 mt-4">
          <Label htmlFor="key-type">Config</Label>
          
            <div className="flex flex-col gap-2 border rounded-md p-2 items-start ">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="derivation-path" className="text-muted-foreground text-xs">Derivation Path</Label>
                  <Input
                    id="derivation-path"
                    placeholder="Derivation Path"
                    className="grow"
                    value={derivationPath}
                    onChange={(e) => setDerivationPath(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="word-count" className="text-muted-foreground text-xs">Word Count</Label>
                  <ToggleGroup
                      type="single"
                      defaultValue="128"
                      onValueChange={setBitLength}
                      value={bitLength}
                    >
                      <ToggleGroupItem value="128">12</ToggleGroupItem>
                      <ToggleGroupItem value="160">15</ToggleGroupItem>
                      <ToggleGroupItem value="256">24</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="passphrase" className="text-muted-foreground text-xs">Passphrase</Label>
                <Input
                  id="passphrase"
                  placeholder="Optional"
                  className="grow"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                />
              </div>
            </div>
        </div>
        )}
      </CardContent>

      {((seedPhrase && seedPhrase.length > 0) || (pk && pk.length > 0)) && (
        <div>
          <Separator className="bg-border h-px" />
          <CardFooter className="flex flex-col justify-between mt-4">
          <div className="flex flex-col gap-2">
            {seedPhrase && seedPhrase.length > 0 && (
              <>
                <div className="flex items-center gap-2 justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Seed Phrase
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(seedPhrase)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <CopyableText value={seedPhrase} />
              </>
            )}
            <Separator className="bg-border h-px my-2" />

            {pubKeys && Object.keys(pubKeys).length > 0 && (
              <div className="flex flex-col gap-4">
                {[
                  { title: "P256", data: pubKeys?.P256 },
                  { title: "secp256k1", data: pubKeys?.SECP256K1 },
                ].map((curve) => (
                  <KeyInfoCard
                      key={curve.title}
                      title={curve.title}
                      privateKey={curve.data?.pk}
                      publicKey={curve.data?.pubK}
                    />
                  ))}
                </div>
              )}
          </div>
        </CardFooter>
      </div>
      )}
    </Card>
  );
}
