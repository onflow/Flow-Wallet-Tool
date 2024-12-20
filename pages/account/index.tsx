import {
  Card,
  CardContent,
  CardDescription,
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
            <CardTitle className="text-2xl font-extrabold tracking-tight lg:text-4xl">Account Tools</CardTitle>
          </div>
        </div>
        <CardDescription className="text-lg">Tools for managing Flow blockchain accounts</CardDescription>
      </CardHeader>
      <Separator/>
      <CardContent className="pt-4">
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Flow accounts are smart contracts that can hold assets and execute transactions. These tools help you create, manage and interact with Flow accounts.
        </p>

        <div className="grid gap-4 mt-6">
          {sidebarData.navMain
            .find(item => item.url === "/account")
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
    </Card>
  )
}