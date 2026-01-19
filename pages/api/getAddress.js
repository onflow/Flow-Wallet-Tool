// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default async function getAddress(req, res) {
  const { publicKey, apikey, network } = JSON.parse(req.body);
  const url = `https://openapi.lilico.app/v1/address${
    network == "testnet" ? "/testnet" : ""
  }?${new URLSearchParams({ publicKey }).toString()}`;
  console.log("url ==>", url);
  const result = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: apikey,
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
  const {data} = await result.json();
  console.log("createAddress ==>", data);
  res.status(200).json({ data });
}
