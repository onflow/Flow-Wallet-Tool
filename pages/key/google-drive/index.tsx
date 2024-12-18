"use client"

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { HardDrive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"
import Image from "next/image";

export default function Page() {
  const [loading, setLoading] = useState(false);
//   const { toast } = useToast()

  const handleSearch = async () => {
    setLoading(true)
  }

  return (
    <Card className="min-w-[450px] max-w-[650px overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <HardDrive />
          <CardTitle>Google Drive</CardTitle>
        </div>
        <CardDescription>Import FRW account from google drive</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4 items-center justify-center flex flex-col gap-2">
        <Image src='/logo.png' alt="logo" width={64} height={64} />
        <h4 className="text-lg font-medium">Flow Wallet</h4>
        <p className="text-sm text-muted-foreground">Inspect FRW account from google drive</p>
        <Button className="mt-4" onClick={handleSearch} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Connect
        </Button>
      </CardContent>
    </Card>
  );
}