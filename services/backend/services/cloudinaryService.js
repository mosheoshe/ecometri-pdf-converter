const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');

/**
 * Process complete PDF: extract text, images, and detect products
 */
async function processFullPDF(pdfBuffer) {
  const batchId = uuidv4();
  
  // Extract text
  const textData = await pdfParse(pdfBuffer);
  const fullText = textData.text;
  
  // Extract images
  const images = await extractImagesFromPDF(pdfBuffer);
  
  // Detect products from text
  const products = detectProducts(fullText);
  
  // Assign images to products (1 image per product)
  const productsWithImages = products.map((product, index) => ({
    ...product,
    imageBase64: images[index] || null,
    batchId
  }));
  
  return {
    products: productsWithImages,
    totalProducts: productsWithImages.length,
    totalImages: images.length,
    batchId
  };
}

/**
 * Extract images from PDF as base64
 */
async function extractImagesFromPDF(pdfBuffer) {
  const images = [];
  
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      const { Resources } = page.node;
      
      if (!Resources) continue;
      
      const xObjects = Resources.lookup('XObject');
      if (!xObjects) continue;
      
      const xObjectKeys = xObjects.entries();
      
      for (const [key, xObject] of xObjectKeys) {
        if (!xObject || typeof xObject.lookup !== 'function') continue;
        
        const subtype = xObject.lookup('Subtype');
        if (!subtype || subtype.toString() !== '/Image') continue;
        
        try {
          const width = xObject.lookup('Width');
          const height = xObject.lookup('Height');
          
          // Only extract reasonable-sized images (likely product images)
          if (width && height && width > 50 && height > 50) {
            const colorSpace = xObject.lookup('ColorSpace');
            const bitsPerComponent = xObject.lookup('BitsPerComponent');
            const filter = xObject.lookup('Filter');
            
            // Extract image bytes
            let imageBytes;
            if (filter && filter.toString() === '/DCTDecode') {
              // JPEG image
              imageBytes = xObject.lookup('stream');
            } else if (filter && filter.toString() === '/FlateDecode') {
              // PNG-like compressed image
              imageBytes = xObject.lookup('stream');
            }
            
            if (imageBytes) {
              // Convert to base64
              const base64 = Buffer.from(imageBytes).toString('base64');
              const mimeType = filter.toString() === '/DCTDecode' ? 'image/jpeg' : 'image/png';
              const dataUrl = `data:${mimeType};base64,${base64}`;
              
              images.push(dataUrl);
            }
          }
        } catch (imgError) {
          console.warn('Error extracting individual image:', imgError.message);
          continue;
        }
      }
    }
  } catch (error) {
    console.error('Error extracting images from PDF:', error);
  }
  
  return images;
}

/**
 * Detect products from PDF text
 */
function detectProducts(text) {
  const products = [];
  
  // Split by common product separators
  const lines = text.split('\n').filter(line => line.trim().length > 10);
  
  // Simple heuristic: look for lines that might be product titles
  // (lines with reasonable length, not too short, not too long)
  const potentialProducts = lines.filter(line => {
    const length = line.trim().length;
    return length >= 15 && length <= 200 && /[a-zA-Z]/.test(line);
  });
  
  // Create product entries
  potentialProducts.forEach((line, index) => {
    products.push({
      rawTitle: line.trim(),
      rawDescription: '', // Will be enhanced by Gemini
      detectedFromPDF: true,
      pageInfo: `Product ${index + 1}`
    });
  });
  
  // If no products detected, create at least one from the full text
  if (products.length === 0) {
    products.push({
      rawTitle: text.substring(0, 100).trim(),
      rawDescription: text.substring(100, 500).trim(),
      detectedFromPDF: true,
      pageInfo: 'Full document'
    });
  }
  
  return products;
}

module.exports = {
  processFullPDF,
  extractImagesFromPDF,
  detectProducts
};
Scroll hacia abajo y haz clic en "Commit changes..." (botón verde)
En el popup, haz clic en "Commit changes" de nuevo
⏸️ PAUSA AQUÍ

Cuando hayas creado este archivo, toma un screenshot mostrando que se creó correctamente (deberías ver backend/services/pdfProcessor.js en la lista) y avísame.

Después continuaremos con los otros 3 archivos.

¿Todo claro? 🚀

Copy
Save to Notion
done
🎉 ¡Excelente! Continuemos
📁 ARCHIVO 2/4: backend/services/cloudinaryService.js
Este archivo contiene la optimización de imágenes a 1080x1080px en WebP (ahorro de 70-80% de peso).

Pasos:

Estás en la carpeta backend/ → Haz clic en "Add file" → "Create new file"
En el campo del nombre escribe: services/cloudinaryService.js
Pega este código completo:
Copyconst cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary with ECOMETRI OPTIMIZATION
 * - Size: 1080x1080px (Ecometri recommended dimensions)
 * - Format: WebP (30% smaller than JPG)
 * - Quality: auto:good (intelligent optimization)
 * - Crop: fill with center gravity
 * - Result: 70-80% storage savings
 */
async function uploadImageOptimized(base64Image, batchId, productIndex) {
  try {
    // Upload with aggressive optimization for Ecometri
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `ecometri/${batchId}`,
      public_id: `product_${productIndex}_${Date.now()}`,
      
      // ECOMETRI SIZE: 1080x1080px
      width: 1080,
      height: 1080,
      crop: 'fill',              // Fill the dimensions
      gravity: 'center',         // Center the image
      
      // WEIGHT OPTIMIZATION
      quality: 'auto:good',      // Intelligent quality (balance quality/size)
      format: 'webp',            // WebP format (30% smaller than JPG)
      
      // PERFORMANCE
      resource_type: 'image',
      type: 'upload',
      overwrite: false,
      invalidate: false,         // Don't invalidate CDN cache (faster)
      
      // NO PRE-GENERATION (save transformations quota)
      eager: [],
      
      // METADATA
      context: `batch_id=${batchId}|product_index=${productIndex}`,
      tags: ['ecometri', 'product', batchId]
    });
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      optimizationApplied: {
        targetSize: '1080x1080px',
        format: 'webp',
        quality: 'auto:good',
        estimatedSavings: '70-80%'
      }
    };
    
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
      url: null
    };
  }
}

/**
 * Upload multiple images in batch with optimization
 */
async function uploadImagesBatch(imagesBase64Array, batchId) {
  const results = [];
  
  for (let i = 0; i < imagesBase64Array.length; i++) {
    const image = imagesBase64Array[i];
    
    if (!image) {
      results.push({ success: false, error: 'No image provided', url: null });
      continue;
    }
    
    const result = await uploadImageOptimized(image, batchId, i);
    results.push(result);
    
    // Small delay to avoid rate limits (free tier)
    if (i < imagesBase64Array.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Delete images from Cloudinary (cleanup)
 */
async function deleteImagesBatch(publicIds) {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      type: 'upload',
      resource_type: 'image'
    });
    
    return {
      success: true,
      deleted: result.deleted,
      deletedCount: Object.keys(result.deleted).length
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get storage usage info
 */
async function getStorageInfo() {
  try {
    const result = await cloudinary.api.usage();
    
    return {
      success: true,
      usage: {
        credits: result.credits,
        usedCredits: result.credits.used,
        limitCredits: result.credits.limit,
        usedPercent: ((result.credits.used / result.credits.limit) * 100).toFixed(2)
      },
      bandwidth: result.bandwidth,
      storage: result.storage,
      transformations: result.transformations
    };
  } catch (error) {
    console.error('Cloudinary usage error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  uploadImageOptimized,
  uploadImagesBatch,
  deleteImagesBatch,
  getStorageInfo
};
