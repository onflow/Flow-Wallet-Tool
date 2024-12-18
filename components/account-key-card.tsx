import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface AccountKeyCardProps {
  account: {
    address: string;
    hashAlgo: string | number;
    signAlgo: string | number;
    keyIndex: number;
    weight: number;
    isRevoked: boolean;
  };
  index: number;
}

export function AccountKeyCard({ account, index }: AccountKeyCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="bg-sidebar py-5">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent flex items-center gap-2 text-md font-medium text-muted-foreground"
            onClick={() => window.open(`https://www.flowscan.io/account/${account.address}`, '_blank')}
          >
            {account.address}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-sm font-medium text-muted-foreground bg-primary/10 px-2 py-0.5 rounded">#{index}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 mt-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Hash Algo", value: account.hashAlgo },
            { label: "Sign Algo", value: account.signAlgo },
            { label: "Key Index", value: account.keyIndex },
            { label: "Weight", value: account.weight },
            { label: "Revoked", value: account.isRevoked ? "Yes" : "No" }
          ].map((field) => (
            <div key={field.label} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 justify-between">
                <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
              </div>
              <p className="text-sm font-medium">{field.value?.toString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 