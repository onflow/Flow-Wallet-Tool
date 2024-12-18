"use client";

import { useState } from "react";
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
import { Eye, EyeOff, ListOrdered, Loader2 } from "lucide-react";
import { KeyInfoCard } from "@/components/key-info-card";
import {
  jsonToKey,
  jsonToMnemonic,
  pk2PubKey,
  seed2PubKey,
} from "@/lib/key-tool";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/copyable-text";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [keystore, setKeystore] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [pubKeys, setPubKeys] = useState<{
    P256: { pubK: string; pk: string };
    SECP256K1: { pubK: string; pk: string };
  } | null>(null);

  const { toast } = useToast();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const ks = JSON.parse(keystore);
      setKeystore(JSON.stringify(ks, null, 2));
      const pk = await jsonToKey(keystore, password);
      if (pk) {
        const pkHex = Buffer.from(pk.data()).toString("hex");
        const pubKeys = await pk2PubKey(pkHex);
        setPubKeys(pubKeys);
      } else {
        const mnemonic = await jsonToMnemonic(keystore, password);
        setMnemonic(mnemonic);
        const pubKeys = await seed2PubKey(mnemonic);
        setPubKeys(pubKeys);
      }
    } catch (error) {
      console.error("Error keystore:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please check your keystore and password.",
      });
    } finally {
      setLoading(false);
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
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="keystore">Keystore</Label>
            <Textarea
              id="keystore"
              className="min-h-[300px]"
              placeholder="Type your keystore here."
              value={keystore}
              onChange={(e) => setKeystore(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="password">Password </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password of keystore file"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
        <Button
          className="w-full mt-4"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding Keys...
            </>
          ) : (
            "Find Keys"
          )}
        </Button>
      </CardContent>
      {pubKeys && (
        <div>
          <Separator className="bg-border h-px" />
          <CardFooter className="flex flex-col justify-between mt-4 mb-4">
            <div className="flex flex-col gap-2">
              {mnemonic && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="mnemonic">Mnemonic</Label>
                  <CopyableText value={mnemonic} />
                  <Separator className="bg-border h-px" />
                </div>
              )}

              <div className="flex gap-4 max-w-[800px] w-full">
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
            </div>
          </CardFooter>
        </div>
      )}
    </Card>
  );
}
