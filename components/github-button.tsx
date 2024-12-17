"use client"

import * as React from "react"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GithubButton() {

  return (
    <Button variant="outline" size="icon" onClick={() => {
      window.open("https://github.com/outblock/flow-wallet-tool", "_blank");
    }}>
        <Github className="h-[1.2rem] w-[1.2rem] scale-100" />
        <span className="sr-only">Github</span>
    </Button>
  )
}
