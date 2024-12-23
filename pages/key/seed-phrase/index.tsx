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
import { Eye, EyeOff, ListOrdered, Download, FileCode } from "lucide-react";
import { KeyInfoCard } from "@/components/key-info-card";
import { seed2KeyStore, seed2PubKey } from "@/lib/key-tool";
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [derivationPath, setDerivationPath] = useState("m/44'/539'/0'/0/0");
  const [pubKeys, setPubKeys] = useState<{
    P256: { pubK: string; pk: string };
    SECP256K1: { pubK: string; pk: string };
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keystorePassword, setKeystorePassword] = useState("");
  const [showKeystorePassword, setShowKeystorePassword] = useState(false);

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

  const handleExportKeystore = async () => {
    if (!pubKeys || !keystorePassword) return;
    try {
      const keystoreJSON = await seed2KeyStore(seedPhrase, keystorePassword);
      const blob = new Blob([JSON.stringify(JSON.parse(keystoreJSON), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const randomHex = Math.random().toString(16).slice(2, 8);
      a.href = url;
      a.download = `flow-wallet-sp-${randomHex}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDialogOpen(false);
      setKeystorePassword("");
      toast({
        title: "Success",
        description: "Keystore file downloaded successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to generate keystore",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <Card className="min-w-[350px] max-w-[650px] overflow-hidden">
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
                Seed Phrase
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
                Derivation Path
              </Label>
              <Input
                id="derivation-path"
                value={derivationPath}
                onChange={(e) => setDerivationPath(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Use default path if unsure.</p>
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
              <p className="text-xs text-muted-foreground">Leave blank if unsure.</p>
            </div>
          </div>
        {/* </form> */}
        <Button className="w-full mt-4" onClick={handleSearch} disabled={!seedPhrase}>
          Find Keys
        </Button>
      </CardContent>
      { pubKeys && (
        <div>
          <Separator className="bg-border h-px" />
          <CardFooter className="flex flex-col justify-between mt-4">
            <div className="flex flex-col gap-2 w-full">
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
              <Separator className="bg-border h-px mt-4" />
              <Button 
                className="w-full mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <FileCode className="mr-2 h-4 w-4" />
                Export Keystore
              </Button>
            </div>
          </CardFooter>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Keystore File</DialogTitle>
            <DialogDescription>
              Please enter a password to encrypt your private key. You will need this password to decrypt the keystore file later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="keystore-password">Password</Label>
              <div className="relative">
                <Input
                  id="keystore-password"
                  type={showKeystorePassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={keystorePassword}
                  onChange={(e) => setKeystorePassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowKeystorePassword(!showKeystorePassword)}
                >
                  {showKeystorePassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full" 
              onClick={handleExportKeystore} 
              disabled={!keystorePassword}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
