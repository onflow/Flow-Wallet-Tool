import * as fcl from "@onflow/fcl";
import {send as httpSend} from "@onflow/transport-http"

export default function fclConfig() {
    const network = process.env.network || 'mainnet'
    console.log('fcl ===>', network)
    if (network === 'mainnet') {
        fcl.config()
        .put("accessNode.api", "https://rest-mainnet.onflow.org")
        .put("sdk.transport", httpSend)
    } else {
        fcl.config()
        .put("accessNode.api", "https://rest-testnet.onflow.org")
        .put("sdk.transport", httpSend)
    }
    return fcl
}