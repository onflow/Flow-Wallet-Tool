// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// const dotenv = require("dotenv");

export default async function createAddress(req, res) {
  const {
    publicKey,
    network,
    hashAlgorithm = "SHA2_256",
    signatureAlgorithm = "ECDSA_P256",
    weight = 1000,
  } = JSON.parse(req.body);
  const url = `https://openapi.lilico.org/v1/address${
    network == "testnet" ? "/testnet" : ""
  }`;
  const result = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: process.env.API_KEY,
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      publicKey,
      weight,
      hashAlgorithm,
      signatureAlgorithm,
    }),
  });
  const json = await result.json();
  const txId = json.data.txId;
  res.status(200).json({ txId });
}
