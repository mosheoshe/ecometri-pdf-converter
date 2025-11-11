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
