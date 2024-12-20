import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image";
import Link from "next/link";
import { sidebarData } from "@/components/config/sidebar-data";

export default function Page() {
  return (
    <Card className="max-w-[800px] overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Image
              src="/flow-logo.svg"
              width={32}
              height={32}
              alt="Flow Blockchain"
              className="cursor-pointer"
            />
            <CardTitle className="text-2xl font-extrabold tracking-tight lg:text-4xl">Key Tools</CardTitle>
          </div>
        </div>
        <CardDescription className="text-lg">Tools for working with Flow account keys and signatures</CardDescription>
      </CardHeader>
      <Separator/>
      <CardContent className="pt-4">
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Flow accounts can have multiple keys with different weights and signing algorithms. These tools help you work with and understand Flow account keys.
        </p>

        <div className="grid gap-4 mt-6">
          {sidebarData.navMain
            .find(item => item.url === "/key")
            ?.items?.map((tool) => (
              <Link
                key={tool.url}
                href={tool.url}
                className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                {tool.icon && <tool.icon className="h-6 w-6 mr-4" />}
                <div>
                  <h3 className="font-semibold">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </Link>
            ))}
        </div>
      </CardContent>
        <Separator/>
        <CardFooter className="bg-green-500/10 flex items-center gap-2 pt-4">
            <Info className="size-8 text-green-500" />
            <p className="text-sm text-muted-foreground">
            This is an open-source project - all code is publicly verifiable. We NEVER collect, store, or transmit private keys or seed phrases. Your security is our priority.
            </p>
        </CardFooter>
    </Card>
  )
}