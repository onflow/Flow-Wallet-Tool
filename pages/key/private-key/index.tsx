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
import { KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { KeyInfoCard } from "@/components/key-info-card";
import { pk2PubKey } from "@/lib/key-tool";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [pk, setPK] = useState("");
  const { toast } = useToast()
  const [pubKeys, setPubKeys] = useState<{
    P256: { pubK: string; pk: string };
    SECP256K1: { pubK: string; pk: string };
  } | null>(null);

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
        <Button className="w-full mt-4" onClick={handleSearch} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Search
        </Button>
      </CardContent>
      {pubKeys && (
        <>
          <Separator className="bg-border h-px" />
          <CardFooter className="flex flex-col justify-between mt-4">
              {/* <Separator className="bg-border h-px my-2" />  */}
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
          </CardFooter>
        </>
      )}
    </Card>
  );
}