import * as fcl from "@onflow/fcl";
import {send as httpSend} from "@onflow/transport-http"

export default function fclConfig() {
    const network = (process.env.NETWORK || 'mainnet') as 'mainnet' | 'testnet';
    
    const networkConfig = {
        mainnet: {
            http: "https://rest-mainnet.onflow.org"
        },
        testnet: {
            http: "https://rest-testnet.onflow.org"
        }
    } as const;

    fcl.config()
        .put("accessNode.api", networkConfig[network].http)
        .put("sdk.transport", httpSend)
    return fcl
}