import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { GithubButton } from "@/components/github-button";
import { usePathname } from 'next/navigation';
import { sidebarData } from "./config/sidebar-data";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Home } from "lucide-react";
import { Separator } from "./ui/separator";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 sticky top-0 shrink-0 items-center backdrop-blur-xl gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 justify-between w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <nav className="flex items-center gap-1">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathname !== "/" && (() => {
                      const parentItem = sidebarData.navMain.find(item =>
                        pathname.startsWith(item.url)
                      );
                      const currentItem = sidebarData.navMain.flatMap(item => item.items || [])
                        .find(item => item.url === pathname);
                      
                      return (
                        <>
                          {parentItem && (
                            <>
                              <BreadcrumbSeparator />
                              <BreadcrumbItem>
                                <BreadcrumbLink href={parentItem.url} className="flex items-center gap-2">
                                  {parentItem.icon && <parentItem.icon className="h-4 w-4" />}
                                  <span>{parentItem.title}</span>
                                </BreadcrumbLink>
                              </BreadcrumbItem>
                            </>
                          )}
                          {currentItem && (
                            <>
                              <BreadcrumbSeparator />
                              <BreadcrumbItem>
                                <BreadcrumbLink href={currentItem.url} className="flex items-center gap-2">
                                  {currentItem.icon && <currentItem.icon className="h-4 w-4" />}
                                  <span>{currentItem.title}</span>
                                </BreadcrumbLink>
                              </BreadcrumbItem>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </BreadcrumbList>
                </Breadcrumb>
              </nav>
            </div>
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