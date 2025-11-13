/**
 * ECOMETRI BACKEND - MULTI-SOURCE CONVERTER
 * 
 * Funcionalidades:
 * - PDF to CSV (extracción de productos y texto)
 * - Web Scraper (Shopify, WooCommerce, Generic stores)
 * - Upload a Cloudinary (gratis 25GB)
 * - Generación de títulos/descripciones con Gemini AI (opcional)
 * - Generación de CSV formato Ecometri (35 columnas)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { processFullPDF } = require('./services/pdfProcessor');
const { generateEcometriCSV } = require('./services/csvGenerator');
const { scrapeStore } = require('./services/webScraperService');
const { enhanceProductsBatch } = require('./services/geminiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar multer para manejar archivos PDF
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Ecometri Multi-Source Converter API',
    version: '2.0.0',
    status: 'online',
    endpoints: {
      health: 'GET /health',
      processPDF: 'POST /api/process-pdf',
      scrapeStore: 'POST /api/scrape-store'
    },
    features: [
      '✅ PDF to CSV conversion',
      '✅ Web Store Scraping (Shopify, WooCommerce, Generic)',
      '✅ Image optimization (1080x1080px WebP)',
      '✅ Cloudinary upload',
      '✅ AI enhancement (optional)',
      '✅ Ecometri CSV format (35 columns)'
    ]
  });
});

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

// ==========================================
// ENDPOINT 1: Process PDF
// ==========================================
app.post('/api/process-pdf', upload.single('pdf'), async (req, res) => {
  try {
    console.log('📄 Nuevo PDF recibido:', req.file?.originalname);
    console.log('📊 Tamaño:', Math.round(req.file?.size / 1024 / 1024), 'MB');

    // Validar archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo PDF'
      });
    }

    // Procesar PDF completo
    const result = await processFullPDF(req.file.buffer, {
      onProgress: (progress) => {
        console.log(`⏳ Progreso: ${progress.step} - ${progress.status}`);
      }
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    // Mejorar productos con IA (opcional)
    console.log('🤖 Enhancing products...');
    const enhancedProducts = await enhanceProductsBatch(result.products);

    // Generar CSV
    console.log('📊 Generating CSV...');
    const csv = generateEcometriCSV(enhancedProducts);

    // Preparar reporte
    const report = {
      batch_id: result.batchId,
      generated_at: new Date().toISOString(),
      total_products: enhancedProducts.length,
      images_extracted: result.stats?.imagesExtracted || 0,
      images_uploaded: result.stats?.imagesUploaded || 0,
      products_enhanced: enhancedProducts.filter(p => p.enhanced).length
    };

    console.log('✅ PDF Process completed:');
    console.log('   - Products:', enhancedProducts.length);
    console.log('   - Images:', report.images_uploaded);

    res.json({
      success: true,
      csv: csv,
      report: report,
      metadata: {
        filename: `ecometri_pdf_${result.batchId}_${Date.now()}.csv`,
        rowCount: enhancedProducts.length,
        columnCount: 35
      },
      products: enhancedProducts.slice(0, 10) // Primeros 10 para preview
    });

  } catch (error) {
    console.error('❌ Error procesando PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// ENDPOINT 2: Scrape Store (WEB SCRAPER)
// ==========================================
app.post('/api/scrape-store', async (req, res) => {
  try {
    const { storeUrl } = req.body;
    
    console.log('🕷️ Nueva solicitud de scraping:', storeUrl);
    
    // Validar URL
    if (!storeUrl) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere una URL de tienda'
      });
    }
    
    // Validar formato URL
    try {
      new URL(storeUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'URL inválida. Por favor ingresa una URL válida (https://ejemplo.com)'
      });
    }
    
    console.log('🔍 Step 1: Scraping tienda...');
    
    // Scrape la tienda
    const scrapeResult = await scrapeStore(storeUrl);
    
    if (!scrapeResult.success) {
      throw new Error('Error al scrape la tienda');
    }
    
    console.log(`✅ Scraped ${scrapeResult.products.length} productos`);
    console.log(`🤖 Step 2: Mejorando productos con IA...`);
    
    // Mejorar con Gemini (opcional, ya que está desactivado)
    const enhancedProducts = await enhanceProductsBatch(scrapeResult.products);
    
    console.log('📊 Step 3: Generando CSV Ecometri...');
    
    // Generar CSV
    const csv = generateEcometriCSV(enhancedProducts);
    
    // Preparar reporte
    const report = {
      batch_id: scrapeResult.batchId,
      generated_at: new Date().toISOString(),
      store_url: storeUrl,
      platform_detected: scrapeResult.platform,
      total_products: enhancedProducts.length,
      products_with_images: enhancedProducts.filter(p => p.imageUrl).length,
      products_with_cloudinary: enhancedProducts.filter(p => p.cloudinaryOptimized).length,
      products_enhanced_ai: enhancedProducts.filter(p => p.enhanced).length
    };
    
    console.log('✅ Proceso de scraping completado:');
    console.log('   - Plataforma:', scrapeResult.platform);
    console.log('   - Productos:', enhancedProducts.length);
    console.log('   - Con imágenes:', report.products_with_images);
    console.log('   - Cloudinary:', report.products_with_cloudinary);
    
    res.json({
      success: true,
      csv: csv,
      report: report,
      metadata: {
        filename: `ecometri_store_${scrapeResult.batchId}_${Date.now()}.csv`,
        rowCount: enhancedProducts.length,
        columnCount: 35
      },
      products: enhancedProducts.slice(0, 10) // Primeros 10 para preview
    });
    
  } catch (error) {
    console.error('❌ Error en scraping:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al scrape la tienda'
    });
  }
});

// Endpoint de progreso (opcional - para streaming)
app.get('/api/progress/:batchId', (req, res) => {
  // TODO: Implementar con WebSockets o Server-Sent Events si se necesita
  res.json({ status: 'processing' });
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 50MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 Ecometri Multi-Source Converter API                   ║');
  console.log('║  📡 Server running on port ' + PORT + '                            ║');
  console.log('║  🌍 Environment: ' + (process.env.NODE_ENV || 'development') + '                             ║');
  console.log('║  ✅ Status: READY                                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📋 Configuration:');
  console.log('   ✅ Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : '❌ Missing');
  console.log('   ✅ Gemini AI:', process.env.GEMINI_API_KEY ? 'Configured (disabled)' : '❌ Missing');
  console.log('');
  console.log('🔗 API Endpoints:');
  console.log('   GET  / - API Info');
  console.log('   GET  /health - Health check');
  console.log('   POST /api/process-pdf - PDF to CSV');
  console.log('   POST /api/scrape-store - Web Scraper (🆕 NEW)');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
