"use client"

import { useState, useEffect } from "react";
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
import { Loader2, Presentation } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button";
import { findTxById, verifySignatureByAddress } from "@/lib/transaction-analyze";
import { CopyableText } from "@/components/copyable-text";

interface TransactionDetails {
  encodedPayload: string;
  encodedEnvelope: string;
  cadence: string;
  payloadSigs: Array<{ address: string; sig: string }>;
  envelopeSigs: Array<{ address: string; sig: string }>;
}

export default function Page() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState("");
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);
  const { toast } = useToast()

  useEffect(() => {
    const txParam = searchParams.get('tx');
    if (txParam) {
      setTxId(txParam);
      handleSearch(txParam);
    }
  }, [searchParams]);

  const handleSearch = async (id?: string) => {
      const searchId = id || txId;
      if (!searchId) return;
      setLoading(true);
      try {
        const tx = await findTxById(searchId)
        setTxDetails(tx)

        console.log(tx)
        tx.payloadSigs.forEach(async (sig: any) => {
          const verified = await verifySignatureByAddress(sig.address, tx.encodedPayload, sig.sig)
          console.log(sig.address, verified)
        })

        tx.envelopeSigs.forEach(async (sig: any) => {
          const verified = await verifySignatureByAddress(sig.address, tx.encodedEnvelope, sig.sig)
          console.log(sig.address, verified)
        })

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
    <Card className="min-w-[650px] max-w-[850px] overflow-hidden">
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
              {/* <Separator orientation="vertical" className="bg-border h-auto" /> */}
              {/* <pre className="text-xs overflow-scroll">{JSON.stringify(txDetails, null, 2)}</pre> */}
              <div className="w-full flex flex-col gap-2">
                <div className="flex flex-col items-start gap-2 overflow-scroll">
                  <Label className="text-xs text-muted-foreground">Encoded Payload</Label>
                  <CopyableText value={txDetails.encodedPayload} className="flex-1" />
                </div>
                <div className="flex flex-col items-start gap-2 overflow-scroll">
                  <Label className="text-xs text-muted-foreground">Encoded Envelope</Label>
                  <CopyableText value={txDetails.encodedEnvelope} className="flex-1" />
                </div>
              </div>

              <div className="flex flex-col w-full items-start gap-2">
                  <Label className="text-xs text-muted-foreground">Cadence</Label>
                  <code className="text-xs w-full overflow-scroll whitespace-pre-wrap border border-border rounded-md p-4">
                    {txDetails.cadence}
                  </code>
              </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}