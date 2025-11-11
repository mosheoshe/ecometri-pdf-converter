require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');

// Import services
const { processFullPDF } = require('./services/pdfProcessor');
const { uploadImagesBatch } = require('./services/cloudinaryService');
const { enhanceProductsBatch } = require('./services/geminiService');
const { generateEcometriCSV, generateCSVMetadata } = require('./services/csvGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Ecometri PDF to CSV Converter API',
    version: '2.3',
    status: 'online',
    endpoints: {
      health: 'GET /',
      processPDF: 'POST /api/process-pdf',
      test: 'GET /api/test'
    },
    features: [
      '✅ PDF text extraction',
      '✅ PDF image extraction',
      '✅ Image optimization (1080x1080px WebP)',
      '✅ Cloudinary upload',
      '✅ AI title/description generation (Gemini)',
      '✅ Ecometri CSV format (35 columns)'
    ]
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    config: {
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      gemini: !!process.env.GEMINI_API_KEY,
      port: PORT
    }
  });
});

// Main PDF processing endpoint
app.post('/api/process-pdf', upload.single('pdf'), async (req, res) => {
  try {
    console.log('📥 Received PDF upload request');

    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    console.log(`📄 Processing PDF: ${req.file.originalname} (${req.file.size} bytes)`);

    // STEP 1: Extract text and images from PDF
    console.log('🔍 Step 1: Extracting PDF content...');
    const pdfData = await processFullPDF(req.file.buffer);
    console.log(`✅ Extracted ${pdfData.totalProducts} products, ${pdfData.totalImages} images`);

    // STEP 2: Upload images to Cloudinary with optimization
    console.log('☁️  Step 2: Uploading images to Cloudinary (1080x1080px WebP)...');
    const imageUploads = await uploadImagesBatch(
      pdfData.products.map(p => p.imageBase64).filter(Boolean),
      pdfData.batchId
    );
    console.log(`✅ Uploaded ${imageUploads.filter(u => u.success).length}/${imageUploads.length} images`);

    // Map image URLs to products
    const productsWithImages = pdfData.products.map((product, index) => ({
      ...product,
      imageUrl: imageUploads[index]?.url || null,
      imageOptimization: imageUploads[index]?.optimizationApplied || null
    }));

    // STEP 3: Enhance with AI (Gemini)
    console.log('🤖 Step 3: Enhancing products with AI...');
    const enhancedProducts = await enhanceProductsBatch(productsWithImages);
    console.log(`✅ Enhanced ${enhancedProducts.filter(p => p.enhanced).length}/${enhancedProducts.length} products with AI`);

    // STEP 4: Generate CSV
    console.log('📊 Step 4: Generating Ecometri CSV...');
    const csv = generateEcometriCSV(enhancedProducts);
    const metadata = generateCSVMetadata(enhancedProducts, pdfData.batchId);
    console.log(`✅ Generated CSV with ${metadata.rowCount} rows, ${metadata.columnCount} columns`);

    // Return response
    res.json({
      success: true,
      csv: csv,
      metadata: metadata,
      report: {
        batchId: pdfData.batchId,
        totalProducts: pdfData.totalProducts,
        productsWithImages: metadata.productsSummary.withImages,
        productsEnhancedByAI: metadata.productsSummary.withAI,
        optimization: {
          imageSize: '1080x1080px',
          format: 'WebP',
          estimatedSavings: '70-80%'
        }
      }
    });

    console.log('✅ Process completed successfully');

  } catch (error) {
    console.error('❌ Error processing PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${error.message}`
    });
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: {
      health: 'GET /',
      processPDF: 'POST /api/process-pdf',
      test: 'GET /api/test'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 Ecometri PDF to CSV Converter API                      ║
║  📡 Server running on port ${PORT}                           ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}                      ║
║  ✅ Status: READY                                          ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  console.log('📋 Configuration:');
  console.log('   ✅ Cloudinary:', !!process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : '❌ Missing');
  console.log('   ✅ Gemini AI:', !!process.env.GEMINI_API_KEY ? 'Configured' : '❌ Missing');
  console.log('');
  console.log('🔗 API Endpoints:');
  console.log('   GET  / - Health check');
  console.log('   GET  /api/test - Test endpoint');
  console.log('   POST /api/process-pdf - Process PDF file');
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
