const axios = require('axios');

module.exports = async (req, res) => {
  console.log('[API] ZAPSIGN_API_KEY existe?', !!process.env.ZAPSIGN_API_KEY);

const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  try {
    const { pdfDataUrl, signers } = req.body;
    const base64 = pdfDataUrl.split(',')[1];

    // 1) Upload do PDF
    const upload = await axios.post(
      'https://api.zapsign.com.br/v2/documents',
      { file_base_64: base64, file_extension: 'pdf' },
      { headers: { Authorization: `Bearer ${process.env.ZAPSIGN_API_KEY}` } }
    );

    // 2) Criação do envelope
    await axios.post(
      'https://api.zapsign.com.br/v2/signatures',
      { document_id: upload.data.id, signers, send_email: true },
      { headers: { Authorization: `Bearer ${process.env.ZAPSIGN_API_KEY}` } }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};
