import * as fcl from "@onflow/fcl"
import { encodeTransactionPayload, encodeTransactionEnvelope } from "@onflow/sdk"
import { verifySignature } from "./key-tool";
import { sha3_256 } from "js-sha3";
import { createHash } from "crypto";

interface FCLAccountKey {
  hashAlgoString: string;
  publicKey: string;
  keyId: number;
}

// interface FCLAccount {
//   keys: FCLAccountKey[];
// }

export interface FCLSignature {
  address: string;
  keyId: number;
  signature: string;
}

const convertSignatureToHex = (signature: string) => {
    return Buffer.from(signature, 'base64').toString('hex')
}

const findTxById = async (id: string) => {
    const fclTransaction = await fcl.send([
        fcl.getTransaction(id)
    ]).then(fcl.decode);

    console.log('fclTransaction', fclTransaction)

    const endpoint = await fcl.config().get("accessNode.api")
    const response = await fetch(`${endpoint}/v1/transactions/${id}`);
    const restTransaction = await response.json();

    // Create formatted transaction object
    const formattedTx = {
        ...fclTransaction,
        cadence: fclTransaction.script,
        arguments: fclTransaction.args,
        computeLimit: fclTransaction.gasLimit,
        refBlock: fclTransaction.referenceBlockId,
        payloadSigs: fclTransaction.payloadSignatures.map((sig: FCLSignature) => ({
            address: sig.address,
            keyId: sig.keyId,
            sig: convertSignatureToHex(sig.signature)
        })),
        envelopeSigs: fclTransaction.envelopeSignatures.map((sig: FCLSignature) => ({
            address: sig.address,
            keyId: sig.keyId,
            sig: convertSignatureToHex(sig.signature)
        })),
        proposalKey: {
            ...fclTransaction.proposalKey,
            sequenceNum: fclTransaction.proposalKey.sequenceNumber,
            keyId: Number(restTransaction.proposal_key.key_index)
        }
    };

    // Encode transaction data
    const encodedPayload = await encodeTransactionPayload(formattedTx);
    const encodedEnvelope = await encodeTransactionEnvelope(formattedTx);

    // Set transaction details with encoded data
    return {
        ...formattedTx,
        encodedPayload,
        encodedEnvelope
    };
}

const createSha256Hash = (text: string) => {
    const data = Buffer.from(text, 'hex')
    const hash = createHash("sha256").update(data).digest("hex");
    return hash;
  };

  const createSha3_256Hash = (text: string) => {
    const data = Buffer.from(text, 'hex')
    const hash = sha3_256(data);
    return hash;
  };

const verifySignatureByAddress = async (address: string, message: string, sig: string ) => {
    const fclAccount = await fcl.send([
        fcl.getAccount(address)
    ]).then(fcl.decode);

    const verified = fclAccount.keys.map(async (key: FCLAccountKey) => {
        let hash: string | undefined;
        if (key.hashAlgoString === "SHA2_256") {
            hash = await createSha256Hash(message);
        } else if (key.hashAlgoString === "SHA3_256") {
            hash = await createSha3_256Hash(message);
        }
        if (!hash) return false;
        return await verifySignature(key.publicKey, sig, hash);
    });

    const result = await Promise.all(verified)

    console.log('verified', result)

    return result.includes(true)
}

export type { FCLSignature };
export { findTxById, verifySignatureByAddress };