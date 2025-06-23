import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { pdfDataUrl, signers } = req.body;
    const base64 = pdfDataUrl.split(',')[1];

    // 1) Upload do PDF
    const upload = await axios.post(
      'https://api.zapsign.com.br/v2/documents',
      { file_base_64: base64, file_extension: 'pdf' },
      {
        auth: {
          username: process.env.ZAPSIGN_API_KEY,
          password: process.env.ZAPSIGN_API_SECRET
        }
      }
    );

    // 2) Criação do envelope
    await axios.post(
      'https://api.zapsign.com.br/v2/signatures',
      {
        document_id: upload.data.id,
        signers,
        send_email: true
      },
      {
        auth: {
          username: process.env.ZAPSIGN_API_KEY,
          password: process.env.ZAPSIGN_API_SECRET
        }
      }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
