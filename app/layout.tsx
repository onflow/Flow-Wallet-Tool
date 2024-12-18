import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider"
import "../public/globals.css";

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle";
import { GithubButton } from "@/components/github-button";

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Flow Wallet Tool Kits",
  description: "A collection of tools for Flow blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 sticky top-0 shrink-0 items-center backdrop-blur-xl gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4 justify-between w-full">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex gap-2">
                    <GithubButton/>
                    <ModeToggle/>
                  </div>
                </div>
              </header>
              <div className="flex p-4 w-full h-full items-center justify-center">
              {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
