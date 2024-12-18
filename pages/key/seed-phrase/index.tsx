"use client"

import { useState} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-separator";
import { Eye, EyeOff, ListOrdered } from "lucide-react";
import { KeyInfoCard } from "@/components/key-info-card";
import { seed2PubKey } from "@/lib/key-tool";
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [derivationPath, setDerivationPath] = useState("m/44'/539'/0'/0/0");
  const [pubKeys, setPubKeys] = useState<{
    P256: { pubK: string; pk: string };
    SECP256K1: { pubK: string; pk: string };
  } | null>(null);

  const { toast } = useToast()

  const handleSearch = async () => {
    try {
      const pubKey = await seed2PubKey(seedPhrase, derivationPath, passphrase);
      setPubKeys(pubKey);
    } catch (error) {
      console.error("Error seed phrase:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please check your seed phrase and derivation path.",
      })
    }
  };

  return (
    <Card className="min-w-[450px] max-w-[650px] overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <ListOrdered />
          <CardTitle>Seed Phrase</CardTitle>
        </div>
        <CardDescription>Derive Keys from Seed Phrase</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        {/* <form> */}
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="seed-phrase">
                Seed Phrase <span className="text-red-500">*</span>{" "}
              </Label>
              <Textarea
                id="seed-phrase"
                className="h-[100px]"
                placeholder="Type your seed phrase here."
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="derivation-path">
                Derivation Path <span className="text-red-500">*</span>
              </Label>
              <Input
                id="derivation-path"
                value={derivationPath}
                onChange={(e) => setDerivationPath(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="passphrase">Passphrase</Label>
              <div className="relative">
                <Input 
                  id="passphrase"
                  type={showPassword ? "text" : "password"}
                  placeholder="Optional"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        {/* </form> */}
        <Button className="w-full mt-4" onClick={handleSearch}>
          Find Keys
        </Button>
      </CardContent>
      { pubKeys && (
        <div>
        <Separator className="bg-border h-px" />
        <CardFooter className="flex flex-col justify-between mt-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-4 max-w-[800px]">
              {[
                { title: "P256", data: pubKeys?.P256 },
                { title: "secp256k1", data: pubKeys?.SECP256K1 }
              ].map((curve) => (
                <KeyInfoCard
                  key={curve.title}
                  title={curve.title}
                  privateKey={curve.data?.pk}
                  publicKey={curve.data?.pubK}
                />
              ))}
            </div>
          </div>
        </CardFooter>
        </div>
      )}
    </Card>
  );
}
