"use client"

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-separator";
import { CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getKeyType, verifySignature } from "@/lib/key-tool";
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [keyType, setKeyType] = useState<"P256" | "SECP256K1" | null>(null);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const { toast } = useToast()

  const handlePublicKeyChange = async (value: string) => {
    setPublicKey(value);
    try {
      const type = await getKeyType(value);
      setKeyType(type);
    } catch (error) {
      console.error("Error getting key type:", error);
      setKeyType(null);
      toast({
        variant: "destructive",
        title: "Invalid public key",
        description: "Please enter a valid public key",
      })
    }
  };

  const handleVerify = async () => {
    if (!keyType) {
      toast({
        variant: "destructive",
        title: "Invalid key type",
        description: "Please enter a valid public key first",
      })
      return;
    }

    try {
      const result = await verifySignature(publicKey, message, signature);
      setVerifyResult(result);
    } catch (error) {
      console.error("Error verifying signature:", error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "Please check your inputs and try again",
      })
    }
  };

  return (
    <Card className="min-w-[350px] max-w-[650px] overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <CircleCheck className="size-5" />
          <CardTitle>Verify Signature</CardTitle>
        </div>
        <CardDescription>Verify signature with public key</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="public-key">Public Key</Label>
              {keyType && (
                <Badge variant={keyType === "P256" ? "default" : "secondary"}>
                  {keyType}
                </Badge>
              )}
            </div>
            <Input
              id="public-key"
              placeholder="Enter public key"
              value={publicKey}
              onChange={(e) => handlePublicKeyChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="message">Original Message</Label>
            <Textarea
              id="message"
              className="h-[100px]"
              placeholder="Enter the original message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="signature">Signature</Label>
            <Textarea
              id="signature"
              className="h-[100px]"
              placeholder="Enter the signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
          </div>
        </div>

        <Button 
          className="w-full mt-4" 
          onClick={handleVerify}
          disabled={!publicKey || !message || !signature}
        >
          Verify Signature
        </Button>

        {verifyResult !== null && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {verifyResult ? (
              <>
                <CircleCheck className="h-5 w-5 text-green-500" />
                <span className="text-green-500 font-medium">Signature Valid</span>
              </>
            ) : (
              <>
                <CircleX className="h-5 w-5 text-red-500" />
                <span className="text-red-500 font-medium">Signature Invalid</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
