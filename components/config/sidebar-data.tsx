import {
    Bot,
    KeyRound,
    Key,
    Braces,
    UserRound,
    EyeIcon,
    Link,
    HardDrive,
    Cloud,
    AppleIcon,
    ListOrdered,
    CaseLower,
    TextIcon
  } from "lucide-react"

export const sidebarData = {
    navMain: [
      {
        title: "Account",
        url: "#",
        icon: UserRound,
        items: [
          {
            title: "Lookup",
            url: "#",
            icon: EyeIcon,
          },
          {
            title: "Link",
            url: "#",
            icon: Link
          },
        ],
      },
      {
        title: "Key",
        url: "#",
        icon: KeyRound,
        isActive: true,
        items: [
          {
            title: "Seed Phrase",
            url: "/key/seed-phrase",
            icon: ListOrdered
          },
          {
            title: "Private Key",
            url: "/key/private-key",
            icon: Key
          },
          {
            title: "KeyStore",
            url: "/key/keystore",
            icon: Braces
          },
          {
            title: "Google Drive",
            url: "/key/google-drive",
            icon: HardDrive
          },
          {
            title: "iCloud",
            url: "/key/icloud",
            icon: Cloud
          }
        ],
      },
      {
        title: "Encode & Decode",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Base64",
            url: "#",
            icon: CaseLower
          },
          {
            title: "RLP",
            url: "#",
            icon: TextIcon
          },
          {
            title: "iOS Config Encode",
            url: "#",
            icon: AppleIcon
          },
        ],
      }
    ]
  }