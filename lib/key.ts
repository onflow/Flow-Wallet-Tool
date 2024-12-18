import { initWasm } from "@trustwallet/wallet-core";
import { FLOW_BIP44_PATH } from "./constants";

const generateSeedPhrase = async (strength: number = 128, passphrase: string = "") => {
  const { HDWallet } = await initWasm();
  const wallet = HDWallet.create(strength, passphrase);
  return wallet.mnemonic();
}

const jsonToKey = async (json: string, password: string) => {
  const { StoredKey, PrivateKey } = await initWasm();
  const keystore = StoredKey.importJSON(Buffer.from(json, "utf-8"));
  const privateKeyData = await keystore.decryptPrivateKey(
    Buffer.from(password, "utf-8")
  );
  const privateKey = PrivateKey.createWithData(privateKeyData);
  return privateKey;
};

const pk2PubKey = async (pk: string) => {
  const { PrivateKey } = await initWasm();
  const privateKey = PrivateKey.createWithData(Buffer.from(pk, "hex"));
  const p256PubK = Buffer.from(
    privateKey.getPublicKeyNist256p1().uncompressed().data()
  )
    .toString("hex")
    .replace(/^04/, "");
  const secp256PubK = Buffer.from(
    privateKey.getPublicKeySecp256k1(false).data()
  )
    .toString("hex")
    .replace(/^04/, "");
  return {
    P256: {
      pubK: p256PubK,
      pk,
    },
    SECP256K1: {
      pubK: secp256PubK,
      pk,
    },
  };
};

const seed2PubKey = async (seed: string) => {
  const { HDWallet, Curve } = await initWasm();
  const wallet = HDWallet.createWithMnemonic(seed, "");
  const p256PK = wallet.getKeyByCurve(Curve.nist256p1, FLOW_BIP44_PATH);
  const p256PubK = Buffer.from(
    p256PK.getPublicKeyNist256p1().uncompressed().data()
  )
    .toString("hex")
    .replace(/^04/, "");
  const SECP256PK = wallet.getKeyByCurve(Curve.secp256k1, FLOW_BIP44_PATH);
  const secp256PubK = Buffer.from(SECP256PK.getPublicKeySecp256k1(false).data())
    .toString("hex")
    .replace(/^04/, "");
  return {
    P256: {
      pubK: p256PubK,
      pk: Buffer.from(p256PK.data()).toString("hex"),
    },
    SECP256K1: {
      pubK: secp256PubK,
      pk: Buffer.from(SECP256PK.data()).toString("hex"),
    },
  };
};

export { generateSeedPhrase, jsonToKey, pk2PubKey, seed2PubKey };
