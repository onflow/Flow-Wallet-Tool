import { pk2PubKey, seed2PubKey } from "./key-tool";
import { findAddressWithKey, AccountKey } from "./find-address-with-pubkey";
import { NETWORK } from "@/utils/constants";
interface PubKeyTuple {
  P256: { pubK: string; pk: string };
  SECP256K1: { pubK: string; pk: string };
}

const findAddress = async (pubKTuple: PubKeyTuple, network: NETWORK, address?: string) => {
  const { P256, SECP256K1 } = pubKTuple;
  const p256Accounts = await findAddressWithKey(P256.pubK, network, address) || [];
  const sepc256k1Accounts = await findAddressWithKey(SECP256K1.pubK, network, address) || [];
  const pA = p256Accounts.map((s: AccountKey) => ({...s, pk: P256.pk}))
  const pS = sepc256k1Accounts.map((s: AccountKey) => ({...s, pk: SECP256K1.pk}))
  const accounts = pA.concat(pS)

  if (!accounts || accounts.length === 0) {
      return null
  }
  return accounts
}

export const findAddressWithPK = async (pk: string, network: NETWORK, address?: string) => {
    const pubKTuple = await pk2PubKey(pk);
    return await findAddress(pubKTuple, network, address);
}

export const findAddressWithSeed = async (seed: string, network: NETWORK, address?: string) => {
  const pubKTuple = await seed2PubKey(seed);
  return await findAddress(pubKTuple, network, address);
}