"use client"

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-separator";
import { TextIcon } from "lucide-react";
import { decode } from 'rlp';
import { CopyableText } from "@/components/copyable-text";
import {decode as fclDecode} from "@onflow/decode"
import { 
  arrToStringArr, 
  hexToUtf8, 
  hexToInt, 
  removeFlowTag 
} from "@/lib/rlp";

interface TransactionData {
  script?: string;
  arguments?: string[];
  referenceBlockId?: string;
  gasLimit?: number;
  proposer?: string;
  keyIndex?: number;
  sequenceNumber?: number;
  payer?: string;
  authorizers?: string[];
  payloadSignatures?: {
    signerIndex: number;
    keyIndex: number;
    sig: string;
  }[];
}

export default function Page() {
  const [rlpText, setRlpText] = React.useState("");
  const [transactionData, setTransactionData] = React.useState<TransactionData>({});
  const [rlpError, setRlpError] = React.useState(false);

  function formatSignatures(sigs: string[][]): { signerIndex: number; keyIndex: number; sig: string; }[] {
    return sigs.map((sig: string[]) => ({
      signerIndex: parseInt(sig[0], 16) || 0,
      keyIndex: parseInt(sig[1], 16) || 0,
      sig: sig[2]
    }));
  }

  async function formatTransaction(decodedArr: string[]) {
    if (decodedArr.length === 2) { // Has both payload and envelope
      const [payload, payloadSigs] = decodedArr;
      const payloadData = await formatPayload(payload as unknown as string[]);
      return { ...payloadData, payloadSignatures: formatSignatures(payloadSigs as unknown as string[][]) };
    } else { // Only payload
      return formatPayload(decodedArr);
    } 
  }
  
  async function formatPayload(arr: string[]): Promise<TransactionData> {
    let decoded = []
    if (Array.isArray(arr[1]) && arr[1].length > 0) {
      const objs = arr[1].map((arg: string) => JSON.parse(hexToUtf8(arg)))
      decoded = await Promise.all(objs.map(a => fclDecode(a)))
      // arr[1] = await Promise.all(objs.map(fcl.decode))
    }

    console.log('arr', arr)

    return {
      script: hexToUtf8(arr[0]),
      arguments: decoded,
      referenceBlockId: arr[2],
      gasLimit: hexToInt(arr[3]),
      proposer: arr[4], 
      keyIndex: hexToInt(arr[5]) || 0,
      sequenceNumber: hexToInt(arr[6]) || 0 || 0,
      payer: arr[7],
      authorizers: Array.isArray(arr[8]) ? arr[8] : []
    };
  }

  const handleRlpChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRlpText(value);
    setRlpError(false);

    if (value.trim()) {
      try {
        const tag = removeFlowTag(value);
        if (!tag) return;
        const buffer = Buffer.from(tag, 'hex');
        const decoded = decode(buffer);
        const decodedArr = arrToStringArr(decoded as Uint8Array[]);
        const txData = await formatTransaction(decodedArr);
        setTransactionData(txData);
      } catch (error) {
        console.error(error);
        setRlpError(true);
        setTransactionData({});
      }
    } else {
      setTransactionData({});
    }
  };

  return (
    <Card className="w-4/5 h-4/5 overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TextIcon />
            <CardTitle>RLP Transaction Decoder</CardTitle>
          </div>
        </div>
        <CardDescription>Decode RLP encoded Flow transactions</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="flex flex-col pt-4 pb-4 gap-8 h-[calc(100%-120px)] overflow-scroll">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="decoded-text">RLP Encoded Transaction (Hex)</Label>
            <Textarea
              id="decoded-text"
              className={`h-[calc(100%-28px)] ${rlpError ? 'border-red-500' : ''}`}
              placeholder="Enter RLP encoded hex string to decode"
              value={rlpText}
              onChange={handleRlpChange}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="decoded-text">Transaction</Label>
            <div className="flex flex-col space-y-4 border p-4 rounded h-[calc(100%-28px)] overflow-scroll">
            {Object.keys(transactionData).length > 0 && (
              <>
                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-sm">Script</Label>
                  <Textarea 
                    value={transactionData.script || ''} 
                    readOnly
                    className="h-[200px] overflow-auto"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-sm">Arguments</Label>
                  {transactionData.arguments?.map((arg, i) => {
                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          {/* <span className="text-muted-foreground text-sm">{i}</span> */}
                          <CopyableText value={arg} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-sm">Reference Block ID</Label>
                  <CopyableText value={transactionData.referenceBlockId || ''} />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-sm">Gas Limit</Label>
                  <CopyableText value={transactionData.gasLimit?.toString() || ''} />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-sm">Proposer</Label>
                  <CopyableText value={transactionData.proposer || ''} />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-sm">Key Index</Label>
                  <CopyableText value={transactionData.keyIndex?.toString() || ''} />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-sm">Sequence Number</Label>
                  <CopyableText value={transactionData.sequenceNumber?.toString() || ''} />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-sm">Payer</Label>
                  <CopyableText value={transactionData.payer || ''} />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-sm">Authorizers</Label>
                  <CopyableText value={transactionData.authorizers?.join(', ') || ''} />
                </div>

                {transactionData.payloadSignatures && transactionData.payloadSignatures.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <Label className="text-muted-foreground text-sm">Payload Signatures</Label>
                    {transactionData.payloadSignatures.map((sig, i) => (
                      <div key={i} className="flex flex-col gap-1 mt-2 border p-2 rounded">
                          <div className="flex flex-col gap-1">
                        <Label className="text-muted-foreground text-sm">Signer Index</Label>
                        <CopyableText value={sig.signerIndex?.toString() || ''} />
                      </div>
                      <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-sm">Key Index</Label>
                            <CopyableText value={sig.keyIndex?.toString() || ''} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-sm">Signature</Label>
                            <CopyableText value={sig.sig || ''} />
                      </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
