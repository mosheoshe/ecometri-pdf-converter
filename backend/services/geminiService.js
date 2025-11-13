const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function initializeGemini() {
  // Gemini desactivado - usar textos del PDF directamente
  return null;
}

async function enhanceProductWithAI(rawTitle, rawDescription = '', imageContext = '') {
  // NO usar Gemini - retornar datos del PDF directamente
  console.log(`Using raw data for product: ${rawTitle.substring(0, 50)}...`);
  
  return {
    title: rawTitle.substring(0, 80) || 'Producto',
    description: rawDescription.substring(0, 500) || rawTitle.substring(0, 500) || 'Descripción del producto',
    enhanced: false,
    aiModel: 'none (Gemini disabled)'
  };
}

async function enhanceProductsBatch(products) {
  console.log(`Processing ${products.length} products WITHOUT AI enhancement...`);
  
  const enhanced = products.map((product, index) => {
    return {
      ...product,
      title: product.rawTitle?.substring(0, 80) || `Producto ${index + 1}`,
      description: product.rawDescription?.substring(0, 500) || product.rawTitle?.substring(0, 500) || 'Descripción del producto',
      enhanced: false,
      aiModel: 'none'
    };
  });
  
  console.log(`✅ Processed ${enhanced.length} products (using original PDF text)`);
  
  return enhanced;
}

module.exports = {
  enhanceProductWithAI,
  enhanceProductsBatch
};
