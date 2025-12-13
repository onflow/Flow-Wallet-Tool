"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { Braces, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  jsonToKey,
  jsonToMnemonic,
  pk2PubKey,
  seed2PubKey,
} from "@/lib/key-tool";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useFCL } from "@/hooks/use-fcl";
import {
  AccountKey,
  findAddressWithKey,
} from "@/lib/find-address-with-pubkey";
import { KeystoreResultCard } from "@/components/keystore-result-card";
import { CopyableText } from "@/components/copyable-text";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [keystore, setKeystore] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const [pubKeys, setPubKeys] = useState<{
    P256: { pubK: string; pk: string };
    SECP256K1: { pubK: string; pk: string };
  } | null>(null);
  const [accounts, setAccounts] = useState<AccountKey[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { toast } = useToast();
  const { network } = useFCL();

  const extractJsonFromPdf = useCallback(async (file: File) => {
    // Load pdf.js from a static copy under /public to avoid bundler chunk issues.
    // Use webpackIgnore so Next fetches it at runtime from /public.
    // @ts-ignore
    const pdfjsLib = await import(/* webpackIgnore: true */ "/pdf.min.mjs");
    const { getDocument, GlobalWorkerOptions } =
      pdfjsLib as typeof import("pdfjs-dist");
    if (!GlobalWorkerOptions.workerSrc) {
      GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += ` ${pageText}`;
    }

    const start = fullText.indexOf("{");
    const end = fullText.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Unable to locate keystore JSON inside the PDF");
    }

    const candidate = fullText.slice(start, end + 1);
    JSON.parse(candidate); // Validate JSON before returning
    return candidate;
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      const isJson =
        file.type === "application/json" ||
        file.name.toLowerCase().endsWith(".json");

      if (!isPdf && !isJson) {
        toast({
          variant: "destructive",
          title: "Unsupported file",
          description: "Please upload a PDF recovery file or JSON keystore.",
        });
        return;
      }

      setProcessingFile(true);
      try {
        let content: string;

        if (isPdf) {
          toast({
            title: "Extracting keystore",
            description: "Reading keystore JSON from PDF file...",
          });
          content = await extractJsonFromPdf(file);
        } else {
          content = await file.text();
        }

        const parsed = JSON.parse(content);
        setKeystore(JSON.stringify(parsed, null, 2));
        setPubKeys(null);
        setMnemonic("");
        setAccounts([]);
        toast({
          title: "Keystore loaded",
          description: `Imported from ${isPdf ? "PDF" : "JSON"} file.`,
        });
      } catch (error) {
        console.error("Failed to read keystore file:", error);
        toast({
          variant: "destructive",
          title: "Failed to read file",
          description:
            "Could not extract a valid keystore. Please verify the file and try again.",
        });
      } finally {
        setProcessingFile(false);
      }
    },
    [extractJsonFromPdf, toast]
  );

  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        await handleFile(file);
      }
    },
    [handleFile]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await handleFile(file);
      }
    },
    [handleFile]
  );

  const lookupAddresses = useCallback(
    async (pubKeyMap: { P256?: { pubK: string }; SECP256K1?: { pubK: string } }) => {
      const keys = [
        pubKeyMap.P256?.pubK,
        pubKeyMap.SECP256K1?.pubK,
      ].filter(Boolean) as string[];

      if (keys.length === 0) {
        return;
      }

      setAddressLookupLoading(true);
      try {
        const results = await Promise.all(
          keys.map((key) => findAddressWithKey(key, network))
        );
        const flattened = results
          .filter(Boolean)
          .flat() as AccountKey[];

        setAccounts(flattened);

        if (!flattened.length) {
          toast({
            variant: "destructive",
            title: "No Flow addresses found",
            description: "We could not find any accounts using these public keys.",
          });
        }
      } catch (error) {
        console.error("Failed to lookup addresses:", error);
        toast({
          variant: "destructive",
          title: "Address lookup failed",
          description:
            "Unable to fetch Flow addresses from the indexer right now.",
        });
      } finally {
        setAddressLookupLoading(false);
      }
    },
    [network, toast]
  );

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
        lookupAddresses(pubKeys);
      } else {
        const mnemonic = await jsonToMnemonic(keystore, password);
        setMnemonic(mnemonic);
        const pubKeys = await seed2PubKey(mnemonic);
        setPubKeys(pubKeys);
        lookupAddresses(pubKeys);
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

  const addressCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    accounts.forEach((account) => {
      counts[account.address] = (counts[account.address] || 0) + 1;
    });
    return counts;
  }, [accounts]);

  const maxCount = useMemo(() => {
    const values = Object.values(addressCounts);
    return values.length ? Math.max(...values) : 0;
  }, [addressCounts]);

  const curveConfigs = useMemo(() => {
    const configs = [
      { title: "P256", data: pubKeys?.P256 },
      { title: "secp256k1", data: pubKeys?.SECP256K1 },
    ];

    const seen = new Set<string>();
    return configs.filter((curve) => {
      const key = curve.title.toLowerCase();
      if (key === "secp256k1") {
        if (seen.has(key)) return false;
        seen.add(key);
      }
      return true;
    });
  }, [pubKeys]);

  return (
    <Card className="min-w-[350px] max-w-[650px] overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <Braces />
          <CardTitle>Keystore </CardTitle>
        </div>
        <CardDescription>Derive Keys from Keystore File</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="keystore-file">Upload keystore (JSON or PDF)</Label>
            <input
              ref={fileInputRef}
              id="keystore-file"
              type="file"
              accept="application/json,.json,application/pdf,.pdf"
              className="hidden"
              onChange={onFileChange}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-md border-2 border-dashed p-4 text-sm transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Drag & drop PDF or JSON here</span>
                {processingFile && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <span className="text-muted-foreground">
                We will extract the keystore JSON from Blocto recovery PDFs automatically. Click to
                browse if you prefer.
              </span>
            </div>
          </div>
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
          disabled={loading || processingFile || !keystore || !password}
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
            <div className="flex flex-col gap-2 w-full">
              {mnemonic && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="mnemonic">Mnemonic</Label>
                  <CopyableText value={mnemonic} />
                  <Separator className="bg-border h-px" />
                </div>
              )}

              <div className="flex flex-col gap-4 max-w-[800px] w-full">
                {curveConfigs
                  .sort((a, b) => {
                    const aHas = accounts.some((acc) => acc.pubK === a.data?.pubK);
                    const bHas = accounts.some((acc) => acc.pubK === b.data?.pubK);
                    return Number(bHas) - Number(aHas);
                  })
                  .map((curve) => {
                    const matchingAccounts =
                      accounts.filter((acc) => acc.pubK === curve.data?.pubK) || [];
                    const hasAddresses = matchingAccounts.length > 0;

                    return (
                      <KeystoreResultCard
                        key={curve.title}
                        title={curve.title}
                        privateKey={curve.data?.pk}
                        publicKey={curve.data?.pubK}
                        accounts={matchingAccounts}
                        addressCounts={addressCounts}
                        maxCount={maxCount}
                        highlighted={hasAddresses}
                      />
                    );
                  })}
              </div>
            </div>
          </CardFooter>
        </div>
      )}
    </Card>
  );
}
