import { NextApiRequest, NextApiResponse } from 'next';
import pinataSDK from '@pinata/sdk';
import { IncomingForm, File } from 'formidable';
import { createReadStream, promises as fs } from 'fs';

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_KEY
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Handle file array and validate
    const fileArray = files?.file;
    if (!fileArray || !Array.isArray(fileArray)){
      return res.status(400).json({ error: 'Invalid file upload' });
    }

    const file = fileArray[0] as File;
    if (!file?.filepath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create proper readable stream
    const readStream = createReadStream(file.filepath);
    
    // Add error handling for the stream
    readStream.on('error', (err) => {
      throw new Error(`File stream error: ${err.message}`);
    });

    // Upload to Pinata with proper stream handling
    const result = await pinata.pinFileToIPFS(readStream, {
      pinataMetadata: {
        name: file.originalFilename || 'document',
        keyvalues: {
          network: 'l16',
          type: 'provider-document'
        } as any
      }
    });

    // Cleanup temporary file
    await fs.unlink(file.filepath);

    res.status(200).json({ 
      cid: result.IpfsHash,
      url: `ipfs://${result.IpfsHash}`
    });

  } catch (error) {
    console.error('[LUKSO] File upload error:', error);
    res.status(500).json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}