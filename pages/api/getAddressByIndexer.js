export default async function getAddressByIndexer(req, res) {
    const { publicKey } = req.query;
    console.log("publicKey ==>", publicKey)
    const url = `https://production.key-indexer.flow.com/key/${publicKey}`;
    console.log("url ==>", url)
    const result = await fetch(url);
    const json = await result.json();
    console.log("result ==>", json);
    res.status(200).json(json);
  }
  