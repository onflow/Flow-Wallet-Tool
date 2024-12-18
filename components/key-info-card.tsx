import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { CopyableText } from "@/components/copyable-text";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface KeyInfoCardProps {
  title: string;
  privateKey?: string;
  publicKey?: string;
}

export function KeyInfoCard({ title, privateKey, publicKey }: KeyInfoCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="bg-sidebar py-2">
        <p className="text-sm font-medium text-muted-foreground uppercase">{title}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 mt-2">
        {[
          ...(privateKey ? [{ label: "Private Key", value: privateKey }] : []),
          { label: "Public Key", value: publicKey }
        ].map((field, index) => (
          <div key={field.label}>
            <div className="flex items-center gap-2 justify-between">
              <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
            </div>
            <CopyableText value={field.value} />
            {index === 0 && privateKey && <Separator className="bg-border h-px" />}
          </div>
        ))}
      </CardContent>
      <CardFooter className="h">
      <Button 
        // className="w-full" 
        variant="secondary"
        onClick={() => window.location.href = `/account/lookup?publicKey=${publicKey}`}
      >
        Lookup <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      </CardFooter>
    </Card>
  );
}