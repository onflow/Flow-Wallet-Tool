import {
    Bot,
    KeyRound,
    Key,
    Braces,
    UserRound,
    Link,
    ListOrdered,
    CaseLower,
    TextIcon,
    UserRoundPlus,
    Plus,
    Binoculars,
    Hash,
    Shield,
    CircleCheck,
    Binary,
    Presentation,
    Blocks
  } from "lucide-react"

export const sidebarData = {
    navMain: [
      {
        title: "Account",
        url: "/account",
        icon: UserRound,
        items: [
            {
            title: "Create",
            url: "/account/create",
            icon: UserRoundPlus,
            },
          {
            title: "Lookup by Key",
            url: "/account/lookup",
            icon: Binoculars,
          },
          {
            title: "Link",
            url: "/account/link",
            icon: Link
          },
        ],
      },
      {
        title: "Key",
        url: "/key",
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
            title: "Verify",
            url: "/key/verify",
            icon: CircleCheck,
          },
          // {
          //   title: "Google Drive",
          //   url: "/key/google-drive",
          //   icon: HardDrive
          // },
          // {
          //   title: "iCloud",
          //   url: "/key/icloud",
          //   icon: Cloud
          // }
        ],
      },
      {
        title: "Transaction",
        url: "/tx",
        icon: Blocks,
        items: [
          {
            title: "Analyze",
            url: "/tx/analyze",
            icon: Presentation
          }
        ],
      },
      {
        title: "Codable",
        url: "/codable",
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
            title: "Hash",
            url: "/code/hash",
            icon: Hash
          },
          {
            title: "AES",
            url: "/code/aes",
            icon: Shield
          },
          {
            title: "Hex",
            url: "/code/hex",
            icon: Binary
          },
        ],
      }
    ]
  }