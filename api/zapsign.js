const axios = require('axios');

module.exports = async (req, res) => {
  console.log('[API] Recebido body:', JSON.stringify(req.body).slice(0,200));
  if (req.method !== 'POST') {
    console.log('[API] Método não permitido:', req.method);
    return res.status(405).end('Method not allowed');
  }

  try {
    const { pdfDataUrl, signers } = req.body;
    console.log('[API] Número de signers:', Array.isArray(signers) ? signers.length : 'inválido');
    
    const base64 = pdfDataUrl.split(',')[1];
    console.log('[API] Tamanho do PDF em base64:', base64?.length);

    const DOCUMENTS_URL  = 'https://api.zapsign.com.br/v2/documents';
    const SIGNATURES_URL = 'https://api.zapsign.com.br/v2/signatures';

    console.log('[API] Fazendo upload do PDF para:', DOCUMENTS_URL);
    const upload = await axios.post(
      DOCUMENTS_URL,
      { file_base_64: base64, file_extension: 'pdf' },
      { headers: { Authorization: `Bearer ${process.env.ZAPSIGN_API_KEY}` } }
    );
    console.log('[API] Resposta do upload:', upload.data);

    console.log('[API] Criando envelope em:', SIGNATURES_URL);
    const envelope = await axios.post(
      SIGNATURES_URL,
      {
        document_id: upload.data.id,
        signers,
        send_email: true
      },
      { headers: { Authorization: `Bearer ${process.env.ZAPSIGN_API_KEY}` } }
    );
    console.log('[API] Envelope criado:', envelope.data);

    return res.json({ success: true, envelope: envelope.data });
  } catch (err) {
    console.error('[API] ERRO interno:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
};
