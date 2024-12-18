import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { GithubButton } from "@/components/github-button";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 sticky top-0 shrink-0 items-center backdrop-blur-xl gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 justify-between w-full">
            <SidebarTrigger className="-ml-1" />
            <div className="flex gap-2">
              <GithubButton />
              <ModeToggle />
            </div>
          </div>
        </header>
        <div className="flex p-4 w-full h-full items-center justify-center">
          {children}
        </div>
      </SidebarInset>
    </>
  );
} 