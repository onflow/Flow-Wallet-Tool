import { NETWORK } from '@/utils/constants';

export default async function getAddressByIndexer(req, res) {
    const { publicKey, network } = req.query;
    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required" });
    }
    const env = network === NETWORK.MAINNET ? "production" : "staging";
    const url = `https://${env}.key-indexer.flow.com/key/${publicKey}`;
    const result = await fetch(url);
    const json = await result.json();
    res.status(200).json(json);
  }
  