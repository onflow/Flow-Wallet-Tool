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
    Blocks,
    ChartNoAxesGantt
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
            description: "Create a new blockchain account from scratch",
            },
          {
            title: "Lookup by Key",
            url: "/account/lookup",
            icon: Binoculars,
            description: "Search and view account details using public key or address",
          },
          {
            title: "Link",
            url: "/account/link",
            icon: Link,
            description: "Connect and manage external wallet connections",
          },
        ],
      },
      {
        title: "Key",
        url: "/key",
        icon: KeyRound,
        items: [
            {
            title: "Generate",
            url: "/key/generate",
            icon: Plus,
            description: "Create a new random wallet key pair",
            },
          {
            title: "Seed Phrase",
            url: "/key/seed-phrase",
            icon: ListOrdered,
            description: "Generate or recover wallet from BIP39 mnemonic phrase",
          },
          {
            title: "Private Key",
            url: "/key/private-key",
            icon: Key,
            description: "Import or export raw private key in hex format",
          },
          {
            title: "KeyStore",
            url: "/key/keystore",
            icon: Braces,
            description: "Create or decrypt password-protected JSON wallet file",
          },
          {
            title: "Verify",
            url: "/key/verify",
            icon: CircleCheck,
            description: "Validate private key and address pair",
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
            url: "/key/analyze",
            icon: Presentation,
            description: "Decode and inspect transaction details and parameters",
          }
        ],
      },
      {
        title: "Codable",
        url: "/code",
        icon: Bot,
        items: [
          {
            title: "Base64",
            url: "/code/base64",
            icon: CaseLower,
            description: "Encode and decode Base64 data formats",
          },
          {
            title: "RLP",
            url: "/code/rlp",
            icon: TextIcon,
            description: "Encode and decode Recursive Length Prefix (RLP) data",
          },
          {
            title: "RLP Transaction",
            url: "/code/rlpTx",
            icon: ChartNoAxesGantt,
            description: "Parse and create RLP-encoded blockchain transactions",
          },
          {
            title: "Hash",
            url: "/code/hash",
            icon: Hash,
            description: "Calculate various cryptographic hash functions",
          },
          {
            title: "AES",
            url: "/code/aes",
            icon: Shield,
            description: "Encrypt and decrypt data using AES encryption",
          },
          {
            title: "Hex",
            url: "/code/hex",
            icon: Binary,
            description: "Convert between hexadecimal and other data formats",
          },
        ],
      }
    ]
  }