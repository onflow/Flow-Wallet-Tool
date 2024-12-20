import * as fcl from "@onflow/fcl";
import { AccountKey as FCLAccountKey } from "@onflow/typedefs"

export interface AccountKey {
    address: string;
    keyIndex: number;
    weight: number;
    hashAlgo: string;
    signAlgo: string;
    pubK: string;
    isRevoked: boolean;
}

export interface IndexerAccountKey {
    address: string;
    keyId: number;
    weight: number;
    isRevoked: boolean;
    hashing: string;
    signing: string;
}

export const findAddressWithKey = async (pubKeyHex: string, address?: string): Promise<Array<AccountKey> | null> => {
    if (!address) {
        const response = await fetch(`/api/getAddressByIndexer?publicKey=${pubKeyHex}`)
        const data = await response.json()
        
        if (data.accounts && data.accounts.length > 0) {
            return data.accounts.map((key: IndexerAccountKey) => ({
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
