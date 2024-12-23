"use client";

import * as React from "react";
import * as fcl from "@onflow/fcl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyableText } from "@/components/copyable-text";
import { Separator } from "@radix-ui/react-separator";
import { Plus, Loader2, SquareArrowOutUpRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generateSeedPhrase,
  seed2PubKey,
} from "@/lib/key-tool";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function Page() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}>
      <CreateAccountForm />
    </GoogleReCaptchaProvider>
  );
}

function CreateAccountForm() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [sealing, setSealing] = React.useState(false);
  const [mode, setMode] = React.useState("pubkey");
  const [publicKey, setPublicKey] = React.useState("");
  const [signAlgo, setSignAlgo] = React.useState("ECDSA_P256");
  const [hashAlgo, setHashAlgo] = React.useState("SHA2_256");
  const [seedPhrase, setSeedPhrase] = React.useState("");
  const [network, setNetwork] = React.useState("mainnet");
  const [txId, setTxId] = React.useState("");
  const [flowAddress, setFlowAddress] = React.useState("");
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleCreateAccount = async () => {
    if (!executeRecaptcha) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "reCAPTCHA not ready yet",
      });
      return;
    }

    try {
      setLoading(true);
      
      const captchaToken = await executeRecaptcha('create_account');
      
      const isVerified = await verifyCaptcha(captchaToken);
      if (!isVerified) {
        throw new Error("Captcha verification failed");
      }

      let finalPublicKey = publicKey;
      if (mode === "seedphrase") {
        if (!seedPhrase) {
          throw new Error("Please generate or enter a seed phrase");
        }
        const pubKeys = await seed2PubKey(seedPhrase);
        finalPublicKey = pubKeys.SECP256K1.pubK;
      } else {
        if (!publicKey) {
          throw new Error("Please enter a public key");
        }
      }

      const response = await fetch("/api/createAddress", {
        method: "POST",
        body: JSON.stringify({
          publicKey: finalPublicKey,
          network,
          hashAlgorithm: mode === "seedphrase" ? "SHA3_256" : hashAlgo,
          signatureAlgorithm: mode === "seedphrase" ? "ECDSA_secp256k1" : signAlgo,
          captchaToken,
        }),
      });

      const { txId } = await response.json();
      
      if (txId) {
        setTxId(txId);
        setSealing(true);

        // Listen for transaction to be sealed
        fcl.tx(txId).onceSealed().then((txDetails) => {
          const accountCreatedEvent = txDetails.events.find(
            (event) => event.type === "flow.AccountCreated"
          );
          
          if (accountCreatedEvent) {
            const address = accountCreatedEvent.data.address;
            setFlowAddress(address);
            toast({
              title: "Success",
              description: `Account created with address: ${address}`,
              action: (
                <ToastAction
                  altText="FlowDiver"
                  onClick={() => window.open(`https://www.flowdiver.io/account/${address}`, '_blank')}
                >
                  View Account
                </ToastAction>
              ),
            });
          }
          setSealing(false);
        }).catch(error => {
          console.error("Transaction sealing error:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to monitor transaction status",
          });
          setSealing(false);
        });

        toast({
          title: "Transaction Submitted",
          description: "Account creation initiated",
          action: (
            <ToastAction
              altText="FlowDiver"
              onClick={() => window.open(`https://www.flowdiver.io/tx/${txId}`, '_blank')}
            >
              View on FlowDiver
            </ToastAction>
          ),
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create account",
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSeed = async () => {
    try {
      setLoading(true);
      const phrase = await generateSeedPhrase(128);
      setSeedPhrase(phrase);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate seed phrase",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCaptcha = async (token: string) => {
    const response = await fetch('/api/verify-captcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    return data.success;
  };

  return (
    <Card className="min-w-[350px] max-w-[650px] w-1/3 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
      <CardHeader className="bg-sidebar">
      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-2">
          <Plus />
          <CardTitle>Create Account</CardTitle>
        </div>
         
         <div className="w-[130px]">
          <Select onValueChange={setMode} defaultValue={mode}>
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Mode</SelectLabel>
                <SelectItem value="pubkey">Public Key</SelectItem>
                <SelectItem value="seedphrase">Seed Phrase</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          </div>
        </div>
        <CardDescription>
          Create Flow Account with Public Key or Seed Phrase
        </CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4 flex flex-col gap-4">

        {mode === "pubkey" ? (
          <>
            <div className="flex flex-col gap-2">
              <Label>Public Key</Label>
              <Input
                placeholder="Enter public key"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Signature Algorithm</Label>
                <Select onValueChange={setSignAlgo} defaultValue={signAlgo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECDSA_P256">P-256</SelectItem>
                    <SelectItem value="ECDSA_secp256k1">secp256k1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label>Hash Algorithm</Label>
                <Select onValueChange={setHashAlgo} defaultValue={hashAlgo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHA2_256">SHA-256</SelectItem>
                    <SelectItem value="SHA3_256">SHA3-256</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Label>Seed Phrase</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Generate or enter seed phrase"
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
              />
              <Button onClick={handleGenerateSeed} disabled={loading}>
                Generate
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <Button 
            className="w-full" 
            onClick={handleCreateAccount}
            disabled={loading || sealing || (mode === "pubkey" ? !publicKey : !seedPhrase)}
          >
            {(loading || sealing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {sealing ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
      </CardContent>
      {(txId || flowAddress) && (
        <>
          <Separator className="bg-border h-px" />
          <CardFooter className="flex flex-col gap-2 mt-4 w-full">
            {txId && (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between gap-2">
                  <Label>Transaction ID</Label>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.open(`https://www.flowdiver.io/tx/${txId}`, '_blank')}
                  >
                    <SquareArrowOutUpRight className="ml-1 h-4 w-4" />
                    View on FlowDiver
                  </Button>
                </div>
                <CopyableText value={txId} />
              </div>
            )}
            {flowAddress && (
                <>
                <Separator className="bg-border h-px w-full" />
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between gap-2">
                  <Label>Flow Address</Label>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.open(`https://www.flowdiver.io/account/${flowAddress}`, '_blank')}
                  >
                    <SquareArrowOutUpRight className="ml-1 h-4 w-4" />
                    View Account
                  </Button>
                </div>
                <CopyableText value={flowAddress} />
              </div>
              </>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
