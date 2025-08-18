// pages/api/zapsign.js  (Next.js / Vercel)
const axios = require('axios');

export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } } // evita 413 Payload Too Large
};

const API_BASE      = 'https://api.zapsign.com.br/api/v1';
const DOCUMENTS_URL = `${API_BASE}/docs/`;

export default async function handler(req, res) {
  console.log('[API] Método:', req.method);
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  try {
    const { pdfDataUrl, signers } = req.body || {};
    if (!pdfDataUrl || !Array.isArray(signers) || signers.length === 0) {
      return res.status(400).json({ success: false, error: 'Parâmetros inválidos' });
    }

    const base64 = String(pdfDataUrl).split(',')[1];
    console.log('[API] Signers:', signers.length, '| base64 len:', base64?.length);

    const response = await axios.post(
      DOCUMENTS_URL,
      {
        name: 'VISTORIA MSE',
        base64_pdf: base64,
        signers
        // opcional:
        // signature_order_active: true,
        // folder_path: '/Vistorias',
        // observers: ['auditoria@mse.com.br']
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ZAPSIGN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('[API] OK:', response.data?.token);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    const apiErr = err.response?.data || err.message;
    console.error('[API] ERRO:', apiErr);
    return res.status(err.response?.status || 500).json({ success: false, error: apiErr });
  }
}
