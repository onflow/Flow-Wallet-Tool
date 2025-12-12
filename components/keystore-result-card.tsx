import { useState, useEffect } from "react";
import { ArrowUpRight, Copy, Eye, EyeOff, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyableText } from "@/components/copyable-text";

interface KeystoreResultCardProps {
  title: string;
  privateKey?: string;
  publicKey?: string;
  accounts: {
    address: string;
    keyIndex: number;
    weight: number;
    hashAlgo: string;
    signAlgo: string;
    pubK: string;
    isRevoked: boolean;
  }[];
  addressCounts: Record<string, number>;
  maxCount: number;
  highlighted?: boolean;
}

export function KeystoreResultCard({
  title,
  privateKey,
  publicKey,
  accounts,
  addressCounts,
  maxCount,
  highlighted,
}: KeystoreResultCardProps) {
  const [showPrivate, setShowPrivate] = useState(false);
  const [isPublicKeySectionExpanded, setIsPublicKeySectionExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(accounts.length > 0);

  useEffect(() => {
    if (accounts.length > 0) {
      setIsExpanded(true);
    }
  }, [accounts.length]);

  const handleCopy = (value?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-muted/10 w-full flex-1",
        highlighted ? "border-green-500" : "border-border"
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="text-sm font-semibold text-muted-foreground">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && accounts.length === 0 && (
            <span className="text-xs text-muted-foreground italic">
              No addresses
            </span>
          )}
          {highlighted && (
            <span className="text-xs text-green-600">Matched</span>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-3 px-3 pb-3">
          <div className="flex flex-col gap-2">
            {accounts.length > 0 ? (
              accounts.map((account) => {
                const count = addressCounts[account.address] || 0;
                const isTop =
                  maxCount > 0 && count === maxCount && maxCount > 1;

                return (
                  <div
                    key={`${account.address}-${account.keyIndex}`}
                    className={cn(
                      "flex flex-col rounded-lg border p-3 text-sm bg-background",
                      isTop ? "border-green-500" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `https://www.flowscan.io/account/${account.address}`,
                            "_blank"
                          )
                        }
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        {account.address}
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          key #{account.keyIndex} • weight {account.weight}
                        </span>
                        {isTop && (
                          <span className="rounded-full border border-green-500 px-2 py-0.5 text-green-600">
                            Top match ({count})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {account.signAlgo} / {account.hashAlgo}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                No Flow addresses found for this key.
              </div>
            )}
          </div>

          {privateKey && (
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Private Key
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:text-primary"
                    onClick={() => setShowPrivate((prev) => !prev)}
                  >
                    {showPrivate ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    {showPrivate ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:text-primary"
                    onClick={() => handleCopy(privateKey)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
              </div>
              {showPrivate ? (
                <CopyableText
                  value={privateKey}
                  className="w-full break-all rounded border border-border bg-muted px-2 py-1 text-sm cursor-pointer hover:bg-muted/70 font-mono min-h-[40px]"
                />
              ) : (
                <div className="w-full rounded border border-border bg-muted px-2 py-1 text-sm text-muted-foreground font-mono min-h-[40px] flex items-center">
                  Private key hidden — click Show to reveal.
                </div>
              )}
            </div>
          )}

          {publicKey && (
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setIsPublicKeySectionExpanded((prev) => !prev)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                    {isPublicKeySectionExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span>Public Key</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:text-primary"
                  onClick={() => handleCopy(publicKey)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              {isPublicKeySectionExpanded && (
                <CopyableText
                  value={publicKey}
                  className="w-full break-all rounded border border-border bg-muted px-2 py-1 text-sm cursor-pointer hover:bg-muted/70 font-mono min-h-[40px]"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
