"use client"

import { useEffect, useState, useCallback } from "react";
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
import { Binoculars, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router";
import { findAddressWithKey } from "@/lib/find-address-with-pubkey";
import { AccountKeyCard } from "@/components/account-key-card";
import { AccountKey } from "@/lib/find-address-with-pubkey";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { query } = router;
  const [pubKey, setPubKey] = useState<string>("");
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<AccountKey[]>([]);

  const handleSearch = useCallback(async (publicKey?: string) => {
    const pubK = publicKey || pubKey;
    if (!pubK) return;
    setLoading(true);
    try {
      const result = await findAddressWithKey(pubK);
      if (result) {
        setAccounts(result);
      }
      if (!result || result.length === 0) {
        toast({
          variant: "destructive",
          title: "No accounts found",
          description: "No accounts found for the given public key.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  }, [pubKey, toast]);

  useEffect(() => {
    if (query.publicKey) {
      setPubKey(query.publicKey as string);
      handleSearch(query.publicKey as string);
    }
  }, [query.publicKey, handleSearch]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <Card className="min-w-[450px] max-w-[650px overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <Binoculars />
          <CardTitle>Lookup Account</CardTitle>
        </div>
        <CardDescription>Find Flow Account by Public Key</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="public-key">Public Key</Label>
              <Input 
                id="public-key" 
                placeholder="Enter public key"
                value={pubKey}
                onChange={(e) => setPubKey(e.target.value)}
                className="h-12"
              />
            </div>
        </div>
        <Button 
          className="w-full mt-4" 
          onClick={() => handleSearch()} 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Search
        </Button>
      </CardContent>
      {accounts && accounts.length > 0 && (
        <>
          <Separator className="bg-border h-px" />
          <CardFooter className="w-full mt-4">
            <div className="flex flex-col gap-4 w-full">
              {accounts.map((account, index) => (
                <AccountKeyCard 
                  key={account.address} 
                  account={account} 
                  index={index}
                />
              ))}
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
