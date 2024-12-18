"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { NetworkStatus } from "./network-status"
import { sidebarData } from "./config/sidebar-data"
import Image from "next/image"
import Link from 'next/link'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-400">
                  <Image 
                    src="/logo.png" 
                    width={32} 
                    height={32} 
                    alt="Flow Wallet"
                    priority
                    onError={(e) => {
                      console.error('Error loading image:', e);
                    }}
                  />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Flow Wallet</span>
                  <span className="truncate text-neutral-500 text-xs">
                    Tool Kits
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NetworkStatus />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
