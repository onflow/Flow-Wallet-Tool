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
    TextIcon,
    UserRoundPlus,
    Plus
  } from "lucide-react"

export const sidebarData = {
    navMain: [
      {
        title: "Account",
        url: "#",
        icon: UserRound,
        items: [
            {
            title: "Create",
            url: "/account/create",
            icon: UserRoundPlus,
            },
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
            title: "Generate",
            url: "/key/generate",
            icon: Plus,
            },
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
            url: "/code/base64",
            icon: CaseLower
          },
          {
            title: "RLP",
            url: "/code/rlp",
            icon: TextIcon
          },
          {
            title: "iOS Config Encode",
            url: "/code/ios-config-encode",
            icon: AppleIcon
          },
        ],
      }
    ]
  }