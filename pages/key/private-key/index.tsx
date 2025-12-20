"use client"

import { useState, useCallback, useMemo, useRef } from "react";
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
import { Download, Eye, EyeOff, FileCode, KeyRound, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { KeystoreResultCard } from "@/components/keystore-result-card";
import { cn } from "@/lib/utils";
import { pk2PubKey, pk2KeyStore } from "@/lib/key-tool";
import { useFCL } from "@/hooks/use-fcl";
import { AccountKey, findAddressWithKey } from "@/lib/find-address-with-pubkey";
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
  const [pdfPassword, setPdfPassword] = useState("");
  const [pdfPasswordDialogOpen, setPdfPasswordDialogOpen] = useState(false);
  const [showPdfPassword, setShowPdfPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { toast } = useToast()
  const [pubKeys, setPubKeys] = useState<{
    P256: { pubK: string; pk: string };
    SECP256K1: { pubK: string; pk: string };
  } | null>(null);
  const [accounts, setAccounts] = useState<AccountKey[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { network } = useFCL();

  const extractJsonFromPdf = useCallback(async (file: File, password?: string) => {
    // @ts-ignore
    const pdfjsLib = await import(/* webpackIgnore: true */ "/pdf.min.mjs");
    const { getDocument, GlobalWorkerOptions } =
      pdfjsLib as typeof import("pdfjs-dist");
    if (!GlobalWorkerOptions.workerSrc) {
      GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({
      data: arrayBuffer,
      password: password || undefined,
    });
    
    const findJsonWithPrivateKey = (text: string) => {
      const lower = text.toLowerCase();
      const keyTokens = ["privatekey", "private_key"];
      let keyIndex = -1;
      for (const token of keyTokens) {
        keyIndex = lower.indexOf(token);
        if (keyIndex !== -1) break;
      }
      if (keyIndex === -1) return null;

      const start = text.lastIndexOf("{", keyIndex);
      if (start === -1) return null;

      let depth = 0;
      for (let i = start; i < text.length; i += 1) {
        const char = text[i];
        if (char === "{") depth += 1;
        if (char === "}") depth -= 1;
        if (depth === 0) {
          return text.slice(start, i + 1);
        }
      }
      return null;
    };

    try {
      const pdf = await loadingTask.promise;
      const attachments = (pdf as typeof pdf & { getAttachments?: () => Promise<Record<string, { filename?: string; content?: Uint8Array }> | null> })
        .getAttachments
        ? await (pdf as typeof pdf & { getAttachments: () => Promise<Record<string, { filename?: string; content?: Uint8Array }> | null> }).getAttachments()
        : null;

      if (attachments) {
        const attachmentItems = Object.values(attachments);
        for (const attachment of attachmentItems) {
          if (!attachment?.content) continue;
          try {
            const decoded = new TextDecoder("utf-8").decode(attachment.content);
            JSON.parse(decoded);
            return { json: decoded };
          } catch {
            // Keep checking attachments.
          }
        }
      }

      let spacedText = "";
      let rawText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageItems = textContent.items as Array<{ str: string; hasEOL?: boolean }>;
        const pageSpaced = pageItems.map((item) => item.str).join(" ");
        const pageRaw = pageItems
          .map((item) => item.str + (item.hasEOL ? "\n" : ""))
          .join("");
        spacedText += ` ${pageSpaced}`;
        rawText += pageRaw;
      }

      const candidates = [
        findJsonWithPrivateKey(spacedText),
        findJsonWithPrivateKey(rawText),
        findJsonWithPrivateKey(rawText.replace(/\s+/g, "")),
      ].filter(Boolean) as string[];

      if (!candidates.length) {
        throw new Error("Unable to locate JSON inside the PDF");
      }

      for (const candidate of candidates) {
        try {
          JSON.parse(candidate);
          return { json: candidate };
        } catch {
          // Try next candidate.
        }
      }

      throw new Error("Unable to parse JSON inside the PDF");
    } catch (error: any) {
      if (error?.name === "PasswordException") {
        return {
          error:
            error?.code === 2
              ? "PDF_PASSWORD_INCORRECT"
              : "PDF_PASSWORD_REQUIRED",
        };
      }
      throw error;
    }
  }, []);

  const handleFile = useCallback(
    async (file: File, password?: string) => {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        toast({
          variant: "destructive",
          title: "Unsupported file",
          description: "Please upload a PDF file.",
        });
        return;
      }

      setProcessingFile(true);
      try {
        const result = await extractJsonFromPdf(file, password);
        if ("error" in result) {
          setPendingFile(file);
          setPdfPasswordDialogOpen(true);
          if (result.error === "PDF_PASSWORD_INCORRECT") {
            toast({
              variant: "destructive",
              title: "Incorrect PDF password",
              description: "Please try again with the correct password.",
            });
          }
          return;
        }
        const parsed = JSON.parse(result.json);
        
        const extractedPk =
          parsed.privatekey || parsed.private_key || parsed.privateKey;
        if (extractedPk) {
          setPK(extractedPk);
          setPubKeys(null);
          setAccounts([]);
          toast({
            title: "Private key extracted",
            description: "Private key has been extracted from PDF and filled in.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "No private key found",
            description: "Could not find private_key in the JSON.",
          });
        }
        
        setPdfPasswordDialogOpen(false);
        setPdfPassword("");
        setPendingFile(null);
      } catch (error: any) {
        console.error("Failed to read PDF file:", error);
        toast({
          variant: "destructive",
          title: "Failed to read file",
          description: "Could not extract private key from PDF. Please verify the file and try again.",
        });
      } finally {
        setProcessingFile(false);
      }
    },
    [extractJsonFromPdf, toast]
  );

  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        try {
          await handleFile(file);
        } catch (error) {
          // Error is already handled in handleFile
          console.error("Error in onDrop:", error);
        }
      }
    },
    [handleFile]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          await handleFile(file);
        } catch (error) {
          // Error is already handled in handleFile
          console.error("Error in onFileChange:", error);
        }
      }
      event.target.value = "";
    },
    [handleFile]
  );

  const handlePdfPasswordSubmit = async () => {
    if (!pendingFile || !pdfPassword) return;
    try {
      await handleFile(pendingFile, pdfPassword);
    } catch (error) {
      // Error is already handled in handleFile
      console.error("Error in handlePdfPasswordSubmit:", error);
    }
  };

  const triggerFilePicker = useCallback(() => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  }, []);

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

  const lookupAddresses = useCallback(
    async (pubKeyMap: { P256?: { pubK: string }; SECP256K1?: { pubK: string } }) => {
      const keys = [
        pubKeyMap.P256?.pubK,
        pubKeyMap.SECP256K1?.pubK,
      ].filter(Boolean) as string[];

      if (!keys.length) return;

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
      if (!pk) return;
      setLoading(true);
      try {
          const result = await pk2PubKey(pk);
          setPubKeys(result);
          lookupAddresses(result);
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
          <KeyRound />
          <CardTitle>Private Key</CardTitle>
        </div>
        <CardDescription>Derive Keys from Private Key</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="pdf-file">Upload PDF (Optional)</Label>
              <input
                ref={fileInputRef}
                id="pdf-file"
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={onFileChange}
              />
              <label
                htmlFor="pdf-file"
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.preventDefault();
                  triggerFilePicker();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    triggerFilePicker();
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
                  <span className="font-medium">Drag & drop PDF here</span>
                  {processingFile && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <span className="text-muted-foreground">
                Click to browse if you prefer.
                </span>
              </label>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="private-key">Private Key</Label>
              <Input 
                id="private-key" 
                placeholder="Enter private key or upload PDF"
                value={pk}
                onChange={(e) => setPK(e.target.value)}
                className="h-12"
              />
            </div>
        </div>
        <Button
          className="w-full mt-4"
          onClick={handleSearch}
          disabled={!pk || loading || addressLookupLoading}
        >
          {loading || addressLookupLoading ? (
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
        <>
          <Separator className="bg-border h-px" />
          <CardFooter className="flex flex-col justify-between mt-4">
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

      <Dialog open={pdfPasswordDialogOpen} onOpenChange={setPdfPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PDF Password Required</DialogTitle>
            <DialogDescription>
              This PDF is password protected. Please enter the password to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pdf-password">PDF Password</Label>
              <div className="relative">
                <Input
                  id="pdf-password"
                  type={showPdfPassword ? "text" : "password"}
                  placeholder="Enter PDF password"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pdfPassword) {
                      handlePdfPasswordSubmit();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPdfPassword(!showPdfPassword)}
                >
                  {showPdfPassword ? (
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
              variant="outline" 
              onClick={() => {
                setPdfPasswordDialogOpen(false);
                setPdfPassword("");
                setPendingFile(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePdfPasswordSubmit} disabled={!pdfPassword}>
              <Upload className="mr-2 h-4 w-4" />
              Extract Private Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
