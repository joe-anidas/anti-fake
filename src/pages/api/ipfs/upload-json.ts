import { NextApiRequest, NextApiResponse } from 'next';
import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await pinata.pinJSONToIPFS(req.body.data, {
      pinataMetadata: {
        name: 'user-metadata',
      }
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Pinata upload error:', error);
    res.status(500).json({ error: 'IPFS upload failed' });
  }
}