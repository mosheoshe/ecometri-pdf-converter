/**
 * ECOMETRI BACKEND - Optimizado para Imágenes 1080x1080px WebP
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { processFullPDF } = require('./services/pdfProcessor');
const { generateEcometriCSV } = require('./services/csvGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Configurar multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    version: '2.0.0',
    services: {
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

// Procesar PDF
app.post('/api/process-pdf', upload.single('pdf'), async (req, res) => {
  try {
    console.log('📄 PDF recibido:', req.file.originalname);

    const result = await processFullPDF(req.file.buffer);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    const csv = generateEcometriCSV(result.products);

    res.json({
      success: true,
      csv: csv,
      report: {
        batch_id: result.batchId,
        total_products: result.products.length,
        images_uploaded: result.stats.imagesUploaded,
        warnings: result.warnings
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Backend iniciado');
  console.log('📡 Puerto:', PORT);
  console.log('✅ Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : '❌');
  console.log('✅ Gemini AI:', process.env.GEMINI_API_KEY ? 'OK' : '❌');
  console.log('💡 Optimización: Imágenes 1080x1080px, WebP');
});

module.exports = app;
