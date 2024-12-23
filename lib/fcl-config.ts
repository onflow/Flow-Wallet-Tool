import * as fcl from "@onflow/fcl";
import {send as httpSend} from "@onflow/transport-http"
import { NETWORK } from "@/utils/constants";

export default function fclConfig(network: NETWORK) {
    
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