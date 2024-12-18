// import {
//     decodeAuthenticatorData,
//     decodeClientDataJSON,
//     decodeAttestationObject,
//   } from "./WebAuthnDecoder";

// interface CredentialCreationResult extends Credential {
//   response: {
//     attestationObject: ArrayBuffer;
//   };
//   id: string;
// }

// const createPasskey = async (name: string, displayName: string) => {
//   const userId = getRandomBytes(16);
//   const setup: CredentialCreationOptions = {
//     publicKey: {
//       challenge: getRandomBytes(20),
//       rp: {
//         name: window.location.hostname,
//       },
//       user: {
//         id: userId,
//         name,
//         displayName,
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7,
//         },
//       ],
//       authenticatorSelection: {
//         authenticatorAttachment: "cross-platform",
//       },
//       timeout: 60000,
//       attestation: "direct" as AttestationConveyancePreference
//     },
//   };
//   const result = await navigator.credentials.create(setup) as CredentialCreationResult;
//   if (!result) throw new Error("Failed to create credential");
  
//   console.log("result ==>", result);
//   const attestationObject = decodeAttestationObject(
//     result.response.attestationObject
//   );
//   console.log("attestationObject ==>", attestationObject);
//   const authData = decodeAuthenticatorData(attestationObject.authData);
//   console.log("authData ==>", authData);
  
//   if (setup.publicKey) {
//     addCredential(
//       readSettings(),
//       setup.publicKey.user,
//       result.id,
//       authData.attestedCredentialData.credentialPublicKey,
//       result.response
//     );
//   }
  
//   return { userId, result, userName: name };
// };

// interface PublicKeyCredentialRequestOptions {
//   challenge: Uint8Array;
//   rpId: string;
//   allowCredentials?: Array<{
//     type: string;
//     id: ArrayBuffer;
//   }>;
// }

// interface CredentialRequestResult extends Credential {
//   response: {
//     clientDataJSON: ArrayBuffer;
//     authenticatorData: ArrayBuffer;
//   };
// }

// const getPasskey = async (id: string) => {
//   const setup: {
//     publicKey: PublicKeyCredentialRequestOptions;
//     userVerification: string;
//   } = {
//     publicKey: {
//       challenge: getRandomBytes(20),
//       rpId: window.location.hostname,
//     },
//     userVerification: "required"
//   };

//   if (id && id.length > 0) {
//     setup.publicKey.allowCredentials = [
//       {
//         type: "public-key",
//         id: decodeArray(id),
//       },
//     ];
//   }

//   console.log("getPasskey setup ==>", setup);
//   const result = await navigator.credentials.get(setup) as CredentialRequestResult;
//   if (!result) throw new Error("Failed to get credential");
  
//   console.log("getPasskey result ==>", result);
//   const json = decodeClientDataJSON(result.response.clientDataJSON);
//   console.log("clientDataJSON =>", json);
//   const test = decodeAuthenticatorData(result.response.authenticatorData);
//   console.log("authenticatorData =>", test);
//   return result;
// };

// interface AuthenticatorResult {
//   response: {
//     userHandle: ArrayBuffer;
//     clientDataJSON: ArrayBuffer;
//   };
// }

// const getPKfromLogin = async (result: AuthenticatorResult) => {
//   const { HDWallet, Curve } = await initWasm();
//   const wallet = HDWallet.createWithEntropy(result.response.userHandle, "");
//   const pk = wallet.getKeyByCurve(Curve.nist256p1, FLOW_BIP44_PATH);
//   const pubk = pk.getPublicKeyNist256p1().uncompressed().data();
//   const json = decodeClientDataJSON(result.response.clientDataJSON);

//   return {
//     mnemonic: wallet.mnemonic(),
//     type: KEY_TYPE.PASSKEY,
//     pk: uint8Array2Hex(pk.data()),
//     pubK: uint8Array2Hex(pubk).replace(/^04/, ""),
//     keyIndex: 0,
//     signAlgo: SIGN_ALGO.P256,
//     hashAlgo: HASH_ALGO.SHA256,
//     addtional: {
//       clientDataJSON: json,
//     },
//   };
// };

// interface RegisterResult {
//   userId: ArrayBuffer;
//   result: any;
// }

// const getPKfromRegister = async ({ userId, result }: RegisterResult) => {
//   console.log(userId, result);
//   if (!userId) {
//     return null;
//   }
//   const { HDWallet, Curve } = await initWasm();
//   const wallet = HDWallet.createWithEntropy(userId, "");
//   const pk = wallet.getKeyByCurve(Curve.nist256p1, FLOW_BIP44_PATH);
//   const pubk = pk.getPublicKeyNist256p1().uncompressed().data();
//   return {
//     type: KEY_TYPE.PASSKEY,
//     mnemonic: wallet.mnemonic(),
//     pk: uint8Array2Hex(pk.data()),
//     pubK: uint8Array2Hex(pubk).replace(/^04/, ""),
//     keyIndex: 0,
//     signAlgo: SIGN_ALGO.P256,
//     hashAlgo: HASH_ALGO.SHA256,
//   };
// };

// const uint8Array2Hex = (input: Uint8Array): string => {
//   return Buffer.from(input).toString("hex");
// };

// export {
//     createPasskey,
//     getPasskey,
//     getPKfromLogin,
//     getPKfromRegister,
//     jsonToKey,
//     pk2PubKey,
//     seed2PubKey,
//   };