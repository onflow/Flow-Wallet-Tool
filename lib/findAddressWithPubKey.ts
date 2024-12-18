import * as fcl from "@onflow/fcl";
import { AccountKey as FCLAccountKey } from "@onflow/typedefs"

interface Account {
    address: string;
}

export const findAddressWithKey = async (pubKeyHex: string, address?: string) => {
    if (!address) {
        const response = await fetch(`/api/getAddressByIndexer?publicKey=${pubKeyHex}`)
        const data = await response.json()
        
        if (data.accounts && data.accounts.length > 0) {
            return data.accounts.map((key: any) => ({
                address: key.address,
                keyIndex: key.keyId,
                weight: key.weight,
                hashAlgo: key.hashing,
                signAlgo: key.signing,
                pubK: pubKeyHex,
                isRevoked: key.isRevoked
            }))
        }
        return null
    }
    return await findAddres(address, pubKeyHex)
}

const findAddres = async (address: string, pubKeyHex: string) => {
    const account = await fcl.account(address)
    const keys = account.keys
    .filter((key: FCLAccountKey) => key.publicKey === pubKeyHex && !key.revoked)
    .filter((key: FCLAccountKey) => key.weight >= 1000 )
    
    if (keys.length == 0) {
        return null
    }

    return keys.map((key: FCLAccountKey) => ({
        address,
        keyIndex: key.index,
        weight: key.weight,
        hashAlgo: key.hashAlgoString,
        signAlgo: key.signAlgoString,
        pubK: key.publicKey,
        isRevoked: key.revoked
    }))
}
