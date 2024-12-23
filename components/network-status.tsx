"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { useFCL } from "@/hooks/use-fcl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { NETWORK } from "@/utils/constants"

const networks = [
  { name: "Mainnet", color: "green-500", network: NETWORK.MAINNET },
  { name: "Testnet", color: "orange-500", network: NETWORK.TESTNET },
]

export function NetworkStatus() {
  const { isMobile } = useSidebar()
  const { network, switchNetwork } = useFCL()
  const [loading, setLoading] = React.useState(false)
  
  const activeNetwork = networks.find(n => n.network === network) || networks[0]

  const handleNetworkSwitch = async (newNetwork: NETWORK) => {
    setLoading(true)
    await switchNetwork(newNetwork)
    setLoading(false)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square items-center rounded justify-center size-8">
                <div className={`aspect-square size-3 rounded-2xl bg-${activeNetwork.color}`}/>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Flow {activeNetwork.name}
                </span>
                <div className="flex items-center gap-1">
                  <span className={`truncate text-xs ${loading ? 'text-gray-400' : `text-${activeNetwork.color}`}`}>
                    {loading ? "Connecting..." : "Connected"}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Network
            </DropdownMenuLabel>
            {networks.map((n) => (
              <DropdownMenuItem
                key={n.name}
                onClick={() => handleNetworkSwitch(n.network)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <div className={`bg-${n.color}  size-2 shrink-0 rounded-full`} />
                </div>
                {n.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
