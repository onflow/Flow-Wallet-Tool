"use client"

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
import { Separator } from "@radix-ui/react-separator";
import { Download, Eye, EyeOff, FileCode, KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { KeyInfoCard } from "@/components/key-info-card";
import { pk2PubKey, pk2KeyStore } from "@/lib/key-tool";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [pk, setPK] = useState("");
  const [password, setPassword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast()
  const [pubKeys, setPubKeys] = useState<{
    P256: { pubK: string; pk: string };
    SECP256K1: { pubK: string; pk: string };
  } | null>(null);

  const handleDownload = async () => {
    if (!pubKeys || !password) return;
    try {
      const keystoreJSON = await pk2KeyStore(pubKeys.P256.pk, password);
      const blob = new Blob([JSON.stringify(JSON.parse(keystoreJSON), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const randomHex = Math.random().toString(16).slice(2, 8);
      a.href = url;
      a.download = `flow-wallet-pk-${randomHex}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDialogOpen(false);
      setPassword("");
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
  }

  const handleSearch = async () => {
      if (!pk) return;
      setLoading(true);
      try {
          const result = await pk2PubKey(pk);
          setPubKeys(result);
      } catch (error) {
          console.error(error);
          toast({
            variant: "destructive", 
            title: "Uh oh! Something went wrong.",
            description: error instanceof Error ? error.message : "An unknown error occurred",
          })
      } finally {
          setLoading(false);
      }
  }

  return (
    <Card className="min-w-[450px] max-w-[650px overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <KeyRound />
          <CardTitle>Private Key</CardTitle>
        </div>
        <CardDescription>Derive Keys from Private Key</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="private-key">Private Key</Label>
              <Input 
                id="private-key" 
                placeholder="Enter private key"
                value={pk}
                onChange={(e) => setPK(e.target.value)}
                className="h-12"
              />
            </div>
        </div>
        <Button className="w-full mt-4" onClick={handleSearch} disabled={!pk || loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Find Keys
        </Button>
      </CardContent>
      {pubKeys && (
        <>
          <Separator className="bg-border h-px" />
          <CardFooter className="flex flex-col justify-between mt-4">
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
            <Separator className="bg-border h-px" />
            <Button className="w-full mt-4" onClick={() => setDialogOpen(true)}>
              <FileCode className="mr-2 h-4 w-4" />
              Export Keystore
            </Button>
          </CardFooter>
        </>
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={handleDownload} disabled={!password}>
            <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}