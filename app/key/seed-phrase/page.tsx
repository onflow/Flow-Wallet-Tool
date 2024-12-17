import * as React from "react";

import { Button } from "@/components/ui/button";
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
import { ListOrdered } from "lucide-react";

export default function Page() {
  return (
    <Card className="w-[450px] overflow-hidden">
      <CardHeader className="bg-sidebar">
        <div className="flex items-center gap-2">
          <ListOrdered />
          <CardTitle>Seed Phrase</CardTitle>
        </div>
        <CardDescription>Find Flow Account by Seed Phrase</CardDescription>
      </CardHeader>
      <Separator className="bg-border h-px" />
      <CardContent className="pt-4">
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="seed-phrase">
                Seed Phrase <span className="text-red-500">*</span>{" "}
              </Label>
              <Textarea
                className="h-[100px]"
                placeholder="Type your seed phrase here."
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="derivation-path">
                Derivation Path <span className="text-red-500">*</span>
              </Label>
              <Input
                className=""
                id="derivation-path"
                value="m/44'/539'/0'/0/0"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="derivation-path">Passphrase</Label>
              <Input className="" id="derivation-path" placeholder="Optional" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button className="w-full">Search</Button>
      </CardFooter>
    </Card>
  );
}
