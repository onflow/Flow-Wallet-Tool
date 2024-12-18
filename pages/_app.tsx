import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { AppProps } from "next/app";
import { Layout } from "@/components/layout";
import "@/public/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SidebarProvider>
    </ThemeProvider>
  );
} 