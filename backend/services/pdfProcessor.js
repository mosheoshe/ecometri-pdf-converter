const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const { uploadImagesToCloudinary } = require('./cloudinaryService');
const { enhanceProductWithAI } = require('./geminiService');
const { v4: uuidv4 } = require('uuid');

async function processFullPDF(pdfBuffer) {
  const batchId = uuidv4();

  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pdfData = await pdfParse(pdfBuffer);
    const allText = pdfData.text;

    const images = await extractImagesFromPDF(pdfDoc);
    const imageUrls = await uploadImagesToCloudinary(images, batchId);

    const products = detectProducts(allText, pdfDoc.getPageCount());
    assignImagesToProducts(products, imageUrls);

    for (let product of products) {
      if (!product.name || product.name.length < 10) {
        const enhanced = await enhanceProductWithAI(product);
        if (enhanced.title) product.name = enhanced.title;
        if (enhanced.description) product.description = enhanced.description;
      }
    }

    const warnings = validateProducts(products);

    return {
      success: true,
      batchId,
      products,
      stats: {
        imagesExtracted: images.length,
        imagesUploaded: imageUrls.length
      },
      warnings
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function extractImagesFromPDF(pdfDoc) {
  const images = [];
  const pages = pdfDoc.getPages();
  
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    try {
      const resources = page.node.Resources();
      if (!resources) continue;
      
      const xObjects = resources.lookup('XObject');
      if (!xObjects) continue;
      
      const xObjectKeys = xObjects.keys();
      
      for (const key of xObjectKeys) {
        try {
          const xObject = xObjects.lookup(key);
          if (!xObject) continue;
          
          const subtype = xObject.lookup('Subtype');
          if (subtype && subtype.toString() === '/Image') {
            const imageStream = xObject.lookup('stream') || xObject;
            const imageBytes = imageStream.contents || imageStream;
            
            if (imageBytes && imageBytes.length > 0) {
              const buffer = Buffer.isBuffer(imageBytes) ? imageBytes : Buffer.from(imageBytes);
              images.push({ data: buffer, page: pageIndex + 1 });
            }
          }
        } catch (err) {
          continue;
        }
      }
    } catch (err) {
      continue;
    }
  }
  
  return images;
}

function detectProducts(text) {
  const products = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  const skuPatterns = [
    /\b(KA-[A-Z0-9/-]+)\b/g,
    /\b(UK-[A-Z0-9-]+)\b/g,
    /\b(MK-[A-Z0-9/-]+)\b/g,
    /\b(UBASS-[A-Z0-9-]+)\b/g,
    /\b([A-Z]{2,4}-[A-Z0-9/-]{3,})\b/g
  ];
  
  let currentCategory = 'Sin categoría';
  const seenSkus = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === line.toUpperCase() && line.length < 60 && line.length > 3) {
      currentCategory = toTitleCase(line);
    }
    
    let foundSku = null;
    for (const pattern of skuPatterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const sku = match[1];
        if (!seenSkus.has(sku)) {
          foundSku = sku;
          seenSkus.add(sku);
          break;
        }
      }
      if (foundSku) break;
    }
    
    if (foundSku) {
      let name = line.replace(foundSku, '').trim();
      products.push({
        sku: foundSku,
        name: name || foundSku,
        description: name.substring(0, 200),
        category: currentCategory,
        price: '',
        imageUrls: []
      });
    }
  }
  
  return products;
}

function assignImagesToProducts(products, imageUrls) {
  if (imageUrls.length === 0) return;
  
  const imagesPerProduct = Math.max(1, Math.floor(imageUrls.length / products.length));
  let imageIndex = 0;
  
  for (const product of products) {
    const productImages = [];
    for (let i = 0; i < Math.min(4, imagesPerProduct); i++) {
      if (imageIndex < imageUrls.length) {
        productImages.push(imageUrls[imageIndex++]);
      }
    }
    product.imageUrls = productImages;
  }
}

function validateProducts(products) {
  const warnings = { missing_price: 0, no_images: 0 };
  for (const product of products) {
    if (!product.price) warnings.missing_price++;
    if (product.imageUrls.length === 0) warnings.no_images++;
  }
  return warnings;
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

module.exports = { processFullPDF };
