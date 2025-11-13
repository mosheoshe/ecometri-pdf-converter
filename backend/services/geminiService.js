const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function initializeGemini() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

async function enhanceProductWithAI(rawTitle, rawDescription = '', imageContext = '') {
  try {
    const ai = initializeGemini();
    
    if (!ai) {
      console.warn('Gemini AI not configured, using raw data');
      return {
        title: rawTitle.substring(0, 80),
        description: rawDescription || rawTitle,
        enhanced: false
      };
    }
    
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
Eres un experto en redacción de catálogos de productos para e-commerce.

DATOS DEL PRODUCTO:
- Título original: ${rawTitle}
- Descripción original: ${rawDescription}
- Contexto de imagen: ${imageContext}

TAREA:
1. Genera un TÍTULO optimizado para e-commerce (máximo 80 caracteres)
2. Genera una DESCRIPCIÓN detallada y atractiva (máximo 500 caracteres)

REQUISITOS:
- El título debe ser claro, profesional y optimizado para SEO
- La descripción debe destacar beneficios, características y casos de uso
- Usa un tono profesional pero cercano
- Si faltan datos, sé creativo pero realista basándote en el contexto

FORMATO DE RESPUESTA (JSON):
{
  "title": "Título optimizado aquí",
  "description": "Descripción detallada aquí"
}

Responde SOLO con el JSON, sin texto adicional.
`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsed.title.substring(0, 80),
        description: parsed.description.substring(0, 500),
        enhanced: true,
        aiModel: 'gemini-1.5-flash'
      };
    }
    
    return {
      title: rawTitle.substring(0, 80),
      description: rawDescription || rawTitle,
      enhanced: false,
      error: 'JSON parsing failed'
    };
    
  } catch (error) {
    console.error('Gemini AI error:', error);
    
    return {
      title: rawTitle.substring(0, 80),
      description: rawDescription || rawTitle.substring(0, 500),
      enhanced: false,
      error: error.message
    };
  }
}

async function enhanceProductsBatch(products) {
  const enhanced = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    console.log(`Enhancing product ${i + 1}/${products.length} with AI...`);
    
    const result = await enhanceProductWithAI(
      product.rawTitle || 'Producto sin título',
      product.rawDescription || '',
      product.pageInfo || ''
    );
    
    enhanced.push({
      ...product,
      ...result
    });
    
    if (i < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return enhanced;
}

module.exports = {
  enhanceProductWithAI,
  enhanceProductsBatch
};
