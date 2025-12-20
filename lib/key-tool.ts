import { initWasm } from "@trustwallet/wallet-core";
import { FLOW_BIP44_PATH } from "./constants";

// Initialize wallet core with custom WASM path
let walletCore: any = null;

async function getWalletCore() {
  if (!walletCore) {
    try {
      const wasmUrl =
        typeof window !== 'undefined'
          ? new URL('/wallet-core.wasm', window.location.origin).toString()
          : 'wallet-core.wasm';
      walletCore = await (initWasm as any)({
        locateFile: (path: string) =>
          path.endsWith('.wasm') ? wasmUrl : path,
      });
    } catch (error) {
      console.error('Failed to initialize wallet core:', error);
      throw error;
    }
  }
  return walletCore;
}

const keccak256 = async (data: Buffer) => {
	const { Hash } = await getWalletCore();
	return Hash.keccak256(data);
}

const generateSeedPhrase = async (
	strength: number = 128,
	passphrase: string = ""
) => {
	const { HDWallet } = await getWalletCore();
	const wallet = HDWallet.create(strength, passphrase);
	return wallet.mnemonic();
};

const generatePrivateKey = async () => {
	const { PrivateKey } = await getWalletCore();
	const pk = PrivateKey.create()
	return Buffer.from(pk.data()).toString("hex")
};

const jsonToKey = async (json: string, password: string) => {
	const { StoredKey, PrivateKey } = await getWalletCore();
	const keystore = StoredKey.importJSON(Buffer.from(json, "utf-8"));
	const privateKeyData = await keystore.decryptPrivateKey(
		Buffer.from(password, "utf-8")
	);
	const privateKey = PrivateKey.createWithData(privateKeyData);
	return privateKey;
};

const jsonToMnemonic = async (json: string, password: string) => {
	const { StoredKey } = await getWalletCore();
	const keystore = StoredKey.importJSON(Buffer.from(json, "utf-8"));
	const mnemonic = await keystore.decryptMnemonic(
		Buffer.from(password, "utf-8")
	);
	return mnemonic;
};

const pk2KeyStore = async (pk: string, password: string) => {
	const { StoredKey, CoinType } = await getWalletCore();
	const privateKey = Buffer.from(pk, "hex");
	const keystore = StoredKey.importPrivateKey(privateKey, "tempKeyStore", Buffer.from(password, "utf-8"), CoinType.ethereum);
	const json = keystore.exportJSON();
	return Buffer.from(json).toString("utf-8");
}

const seed2KeyStore = async (seed: string, password: string) => {
	const { StoredKey, CoinType } = await getWalletCore();
	const keystore = StoredKey.importHDWallet(seed, "tempKeyStore", Buffer.from(password, "utf-8"), CoinType.ethereum);
	const json = keystore.exportJSON();
	return Buffer.from(json).toString("utf-8");
}

const pk2PubKey = async (pk: string) => {
	const { PrivateKey } = await getWalletCore();
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

const seed2PubKey = async (seed: string, path: string = FLOW_BIP44_PATH, passphrase: string = "") => {
	const { HDWallet, Curve } = await getWalletCore();
	const wallet = HDWallet.createWithMnemonic(seed, passphrase);
	const p256PK = wallet.getKeyByCurve(Curve.nist256p1, path);
	const p256PubK = Buffer.from(
		p256PK.getPublicKeyNist256p1().uncompressed().data()
	)
		.toString("hex")
		.replace(/^04/, "");

	const SECP256PK = wallet.getKeyByCurve(Curve.secp256k1, path);
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
const getKeyType = async (pubK: string): Promise<"P256" | "SECP256K1" | null> => {
	const { PublicKey, PublicKeyType } = await getWalletCore();
	const pubkeyData = Buffer.from("04" + pubK.replace("0x", "").replace(/^04/, ""), "hex");
	let pubKey;
	pubKey = PublicKey.createWithData(pubkeyData, PublicKeyType.nist256p1Extended);
	if (!pubKey) {
		pubKey = PublicKey.createWithData(pubkeyData, PublicKeyType.secp256k1Extended);
		if (!pubKey) {
			return null;
		}
		return "SECP256K1";
	}
	return "P256";
}

const verifySignature = async (pubK: string, signature: string, message: string) => {
	const { PublicKey, PublicKeyType } = await getWalletCore();
	const type = await getKeyType(pubK);
	const pubkeyData = Buffer.from("04" + pubK.replace("0x", "").replace(/^04/, ""), "hex");
	const pubKey = PublicKey.createWithData(pubkeyData, type === "P256" ? PublicKeyType.nist256p1Extended : PublicKeyType.secp256k1Extended);
	console.log('verifySignature', type, pubkeyData.toString('hex'), signature, message)
	return pubKey.verify(Buffer.from(signature, "hex"), Buffer.from(message, "hex"));
}

export { generateSeedPhrase, generatePrivateKey, getKeyType, verifySignature, jsonToKey, pk2KeyStore, seed2KeyStore, jsonToMnemonic, pk2PubKey, seed2PubKey, keccak256 };
