import { Info, PocketKnife } from "lucide-react";
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
export default function Page() {
  return (
    <Card className="max-w-[800px] overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {/* <PocketKnife className="size-8"/> */}
            <Image
            src="/flow-logo.svg"
            width={32}
            height={32}
            alt="Flow Blockchain"
            className="cursor-pointer"
          />
            <CardTitle className="text-2xl font-extrabold tracking-tight lg:text-4xl">Flow Wallet Tool Kits</CardTitle>
          </div>
        </div>
        <CardDescription className="text-lg">A collection of tools for Flow blockchain</CardDescription>
      </CardHeader>
      <Separator/>
      <CardContent className="pt-4">
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Welcome to Flow Wallet Tool Kits - an open-source collection of tools and utilities 
          maintained and published by the Flow Wallet team. Our mission is to provide developers
          and users with resources to better understand and work with Flow wallets.
        </p>
        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          Our Purpose
        </h3>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          These tools are designed to help you debug wallet-related issues and gain deeper
          insights into Flow wallet functionality:
        </p>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          <li>Debug common wallet problems</li>
          <li>Explore wallet features and capabilities</li>
          <li>Learn best practices for wallet development</li>
        </ul>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Whether you're a developer building on Flow or a user trying to understand wallet
          mechanics, these tools provide practical solutions and educational resources.
        </p>
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
