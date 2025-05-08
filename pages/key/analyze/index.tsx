"use client"

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
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
import { CheckCircle2, Loader2, Presentation, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button";
import { findTxById, FCLSignature, verifySignatureByAddressFirstKey } from "@/lib/transaction-analyze";
import { CopyableText } from "@/components/copyable-text";

interface TransactionDetails {
  encodedPayload: string;
  encodedEnvelope: string;
  cadence: string;
  payloadSigs: Array<FCLSignature>;
  envelopeSigs: Array<FCLSignature>;
}

interface KeyInfo {
  hashAlgoString?: string;
  signAlgoString?: string;
  weight?: number;
  publicKey?: string;
}

interface KeyInfoWithSignature {
  address: string;
  index: number;
  key: KeyInfo | null;
  sig: string;
}

export default function Page() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState("");
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);
  const { toast } = useToast()
  const [payloadKeyInfo, setPayloadKeyInfo] = useState<Array<{address: string, index: number, sig: KeyInfoWithSignature, key: KeyInfo | null}>>([]);
  const [envelopeKeyInfo, setEnvelopeKeyInfo] = useState<Array<{address: string, index: number, sig: KeyInfoWithSignature, key: KeyInfo | null}>>([]);


  const handleSearch = useCallback(async (id?: string) => {
    const searchId = id || txId;
    if (!searchId) return;
    setLoading(true);
    try {
      const tx = await findTxById(searchId)
      setTxDetails(tx)

      console.log(tx)

      const newPayloadKeyInfo = [];
      for (const sig of tx.payloadSigs) {
        const info = await verifySignatureByAddressFirstKey(sig.address, tx.encodedPayload, sig.sig)
        console.log("newPayloadKeyInfo", info)
        if (info) {
          newPayloadKeyInfo.push({
            address: sig.address,
            index: info.index !== null ? info.index : -1,
            key: info.key,
            sig: sig
          });
          console.log(sig.address, info.index)
        } else {
          newPayloadKeyInfo.push({
            address: sig.address,
            index: -1,
            key: null,
            sig: sig
          });
        }
      }
      setPayloadKeyInfo(newPayloadKeyInfo);

      const newEnvelopeKeyInfo = [];
      for (const sig of tx.envelopeSigs) {
        const info = await verifySignatureByAddressFirstKey(sig.address, tx.encodedEnvelope, sig.sig)
        console.log("newEnvelopeKeyInfo", info)
        if (info) {
          newEnvelopeKeyInfo.push({
            address: sig.address,
            index: info.index !== null ? info.index : -1,
            key: info.key,
            sig: sig
          });
          console.log(sig.address, info.index)
        } else {
          newEnvelopeKeyInfo.push({
            address: sig.address,
            index: -1,
            key: null,
            sig: sig
          });
        }
      }
      setEnvelopeKeyInfo(newEnvelopeKeyInfo);

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
  }, [txId, toast]);

  useEffect(() => {
    const txParam = searchParams.get('tx');
    if (txParam) {
      setTxId(txParam);
      handleSearch(txParam);
    }
  }, [searchParams, handleSearch]);

  return (
    <Card className="min-w-[350px] max-w-[850px] w-1/3 overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <Presentation className="size-5"/>
          <CardTitle>Transaction</CardTitle>
        </div>
        <CardDescription>Analyze Transaction</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tx-id">Transaction ID</Label>
              <Input 
                id="tx-id" 
                placeholder="Enter transaction ID"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className="h-12"
              />
            </div>
        </div>
        <Button className="w-full mt-4" onClick={() => handleSearch()} disabled={!txId || loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Analyze
        </Button>
      </CardContent>
      {txDetails && (
        <>
          <Separator className="bg-border h-px" />
          <CardFooter className="flex flex-col p-4 gap-4 w-full">
              <div className="w-full flex flex-col gap-2">
                <div className="flex flex-col gap-4">
                  {payloadKeyInfo.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Payload Signatures</h3>
                      <div className="flex flex-col gap-4">
                        {payloadKeyInfo.map((key, index) => (
                          <div className="flex flex-col gap-3 p-4 border rounded-md" key={index}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">
                                  Payload {index + 1}
                                  {key.index !== -1 && (
                                    <span className="ml-2 text-muted-foreground">(Key #{key.index})</span>
                                  )}
                                </Label>
                                {key.index === -1 ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              {key.key && (
                                <div className="flex gap-2">
                                  <Badge variant="outline">{key.key?.hashAlgoString}</Badge>
                                  <Badge variant="outline">{key.key?.signAlgoString}</Badge>
                                  <Badge variant="outline">Weight: {key.key?.weight || 'N/A'}</Badge>
                                </div>
                              )}
                            </div>
                            
                            <div className="grid gap-2">
                              <div className="flex flex-col gap-1">
                                <Label className="text-xs text-muted-foreground">Address</Label>
                                <CopyableText value={key.address} />
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <Label className="text-xs text-muted-foreground">Public Key</Label>
                                <CopyableText value={key.key?.publicKey || 'N/A'} />
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <Label className="text-xs text-muted-foreground">Signature</Label>
                                <CopyableText value={key.sig.sig} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {envelopeKeyInfo.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Envelope Signatures</h3>
                      <div className="flex flex-col gap-4">
                        {envelopeKeyInfo.map((key, index) => (
                          <div className="flex flex-col gap-3 p-4 border rounded-md" key={index}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">
                                  Envelope {index + 1}
                                  {key.index !== -1 && (
                                    <span className="ml-2 text-muted-foreground">(Key #{key.index})</span>
                                  )}
                                </Label>
                                {key.index === -1 ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              {key.key && (
                                <div className="flex gap-2">
                                  <Badge variant="outline">{key.key?.hashAlgoString}</Badge>
                                  <Badge variant="outline">{key.key?.signAlgoString}</Badge>
                                  <Badge variant="outline">Weight: {key.key?.weight || 'N/A'}</Badge>
                                </div>
                              )}
                            </div>
                            
                            <div className="grid gap-2">
                              <div className="flex flex-col gap-1">
                                <Label className="text-xs text-muted-foreground">Address</Label>
                                <CopyableText value={key.address} />
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <Label className="text-xs text-muted-foreground">Public Key</Label>
                                <CopyableText value={key.key?.publicKey || 'N/A'} />
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <Label className="text-xs text-muted-foreground">Signature</Label>
                                <CopyableText value={key.sig.sig} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 overflow-scroll">
                  <Label className="text-xs text-muted-foreground">Encoded Payload</Label>
                  <CopyableText value={txDetails.encodedPayload} className="flex-1" />
                </div>
                <div className="flex flex-col items-start gap-2 overflow-scroll">
                  <Label className="text-xs text-muted-foreground">Encoded Envelope</Label>
                  <CopyableText value={txDetails.encodedEnvelope} className="flex-1" />
                </div>
              </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}