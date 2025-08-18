const axios = require('axios');

const API_BASE      = 'https://api.zapsign.com.br/api/v1';
const DOCUMENTS_URL = `${API_BASE}/docs/`;

module.exports = async (req, res) => {
  console.log('[API] Recebido body:', JSON.stringify(req.body).slice(0,200));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfDataUrl, signers } = req.body;

    if (!pdfDataUrl || !signers) {
      return res.status(400).json({ error: 'Faltando pdfDataUrl ou signers' });
    }

    const base64 = pdfDataUrl.split(',')[1];
    console.log('[API] Enviando PDF para ZapSign...');

    const response = await axios.post(
      DOCUMENTS_URL,
      {
        name       : 'VISTORIA MSE',
        base64_pdf : base64,
        signers    : signers
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ZAPSIGN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[API] Documento criado com sucesso:', response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('[API] ERRO interno:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
};
