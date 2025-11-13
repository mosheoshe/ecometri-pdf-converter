const axios = require('axios');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');
const { uploadImagesBatch } = require('./cloudinaryService');

/**
 * Main function to scrape a store and extract products
 */
async function scrapeStore(storeUrl) {
  console.log(`🕷️ Starting scrape for: ${storeUrl}`);
  
  const batchId = uuidv4();
  
  try {
    // Step 1: Detect platform
    const platform = await detectPlatform(storeUrl);
    console.log(`✅ Detected platform: ${platform}`);
    
    // Step 2: Fetch HTML
    const html = await fetchHTML(storeUrl);
    
    // Step 3: Extract products based on platform
    let products = [];
    
    switch (platform) {
      case 'ecometri':
        products = extractEcometriProducts(html, storeUrl);
        break;
      case 'shopify':
        products = await extractShopifyProducts(storeUrl);
        break;
      case 'woocommerce':
        products = extractWooCommerceProducts(html, storeUrl);
        break;
      case 'generic':
        products = extractGenericProducts(html, storeUrl);
        break;
      default:
        products = extractGenericProducts(html, storeUrl);
    }
    
    console.log(`✅ Extracted ${products.length} products`);
    
    // Step 4: Download and upload images to Cloudinary
    const productsWithImages = await processProductImages(products, batchId);
    
    return {
      success: true,
      platform,
      products: productsWithImages,
      totalProducts: productsWithImages.length,
      batchId
    };
    
  } catch (error) {
    console.error('❌ Scraping error:', error);
    throw error;
  }
}

/**
 * Detect e-commerce platform
 */
async function detectPlatform(url) {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    
    // Check for Ecometri
    if (url.includes('ecometri.shop') || 
        url.includes('ecometri.com') ||
        html.includes('ecometri') ||
        $('meta[content*="Ecometri"]').length > 0 ||
        $('[class*="ecometri"]').length > 0) {
      return 'ecometri';
    }
    
    // Check for Shopify
    if (html.includes('Shopify.theme') || 
        html.includes('cdn.shopify.com') || 
        html.includes('myshopify.com') ||
        $('meta[content*="Shopify"]').length > 0) {
      return 'shopify';
    }
    
    // Check for WooCommerce
    if (html.includes('woocommerce') || 
        html.includes('wc-') ||
        $('body').hasClass('woocommerce') ||
        $('link[href*="woocommerce"]').length > 0) {
      return 'woocommerce';
    }
    
    // Check for Magento
    if (html.includes('Magento') || html.includes('mage/')) {
      return 'magento';
    }
    
    // Generic/Unknown
    return 'generic';
    
  } catch (error) {
    console.error('Platform detection error:', error);
    return 'generic';
  }
}

/**
 * Fetch HTML from URL
 */
async function fetchHTML(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 30000,
      maxRedirects: 5
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching HTML:', error.message);
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}

/**
 * Extract Ecometri products
 */
function extractEcometriProducts(html, baseUrl) {
  const $ = cheerio.load(html);
  const products = [];
  
  console.log('🔍 Extracting Ecometri products...');
  
  // Ecometri product selectors (try multiple patterns)
  const productSelectors = [
    '.product-item',
    '.product-card',
    '[data-product]',
    '.item-product',
    'article.product',
    '[class*="product-"]',
    '.product',
    '[itemtype*="Product"]'
  ];
  
  let productElements = $();
  for (const selector of productSelectors) {
    productElements = $(selector);
    if (productElements.length > 0) {
      console.log(`✅ Found ${productElements.length} products with selector: ${selector}`);
      break;
    }
  }
  
  // Fallback: buscar por estructura común
  if (productElements.length === 0) {
    console.log('⚠️ Standard selectors failed, trying fallback method...');
    productElements = $('div, article, li').filter(function() {
      const $elem = $(this);
      return $elem.find('img').length > 0 && 
             ($elem.find('[class*="title"]').length > 0 || 
              $elem.find('[class*="name"]').length > 0 ||
              $elem.find('h1, h2, h3, h4').length > 0) &&
             ($elem.find('[class*="price"]').length > 0 ||
              $elem.find('[class*="precio"]').length > 0);
    });
    console.log(`Found ${productElements.length} products with fallback method`);
  }
  
  productElements.each((index, element) => {
    const $product = $(element);
    
    // Extract title
    const title = $product.find('[class*="title"], [class*="name"], [class*="nombre"], h1, h2, h3, h4').first().text().trim() ||
                  $product.find('a').first().attr('title') ||
                  $product.find('a').first().text().trim() || '';
    
    // Extract description
    const description = $product.find('[class*="description"], [class*="desc"], [class*="descripcion"], p').first().text().trim() || title;
    
    // Extract price
    const priceText = $product.find('[class*="price"], [class*="precio"], [class*="valor"], [class*="cost"]').first().text().trim();
    
    // Extract image
    const image = $product.find('img').first().attr('src') || 
                  $product.find('img').first().attr('data-src') ||
                  $product.find('img').first().attr('data-lazy') ||
                  $product.find('img').first().attr('data-original');
    
    // Extract link
    const link = $product.find('a').first().attr('href') ||
                 $product.closest('a').attr('href');
    
    if (title && title.length > 3) {
      products.push({
        rawTitle: title,
        rawDescription: description || title,
        price: extractPrice(priceText) || '0',
        imageUrl: makeAbsoluteUrl(image, baseUrl),
        images: [makeAbsoluteUrl(image, baseUrl)],
        sourceUrl: makeAbsoluteUrl(link, baseUrl),
        detectedFromWeb: true,
        platform: 'ecometri'
      });
    }
  });
  
  // Si no encontró nada, intentar método super agresivo
  if (products.length === 0) {
    console.log('⚠️ No products found, trying AGGRESSIVE extraction...');
    
    $('img').each((index, img) => {
      if (index > 200) return false; // Limit to first 200 images
      
      const $img = $(img);
      const $parent = $img.closest('div, article, li, section, a');
      
      // Skip if parent is too small (likely not a product)
      if ($parent.text().trim().length < 10) return;
      
      const title = $parent.find('h1, h2, h3, h4, h5, [class*="title"], [class*="name"], [class*="nombre"]').first().text().trim() ||
                    $parent.find('a').first().text().trim() ||
                    $parent.find('strong, b').first().text().trim();
      
      const priceText = $parent.find('[class*="price"], [class*="precio"], [class*="valor"], [class*="cost"]').first().text().trim();
      const image = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy');
      const link = $parent.is('a') ? $parent.attr('href') : $parent.find('a').first().attr('href');
      
      if (title && title.length > 5 && title.length < 200 && image) {
        products.push({
          rawTitle: title,
          rawDescription: title,
          price: extractPrice(priceText) || '0',
          imageUrl: makeAbsoluteUrl(image, baseUrl),
          images: [makeAbsoluteUrl(image, baseUrl)],
          sourceUrl: makeAbsoluteUrl(link, baseUrl),
          detectedFromWeb: true,
          platform: 'ecometri'
        });
      }
    });
  }
  
  // Remove duplicates
  const uniqueProducts = [];
  const seen = new Set();
  
  for (const product of products) {
    const key = product.rawTitle.toLowerCase().trim();
    if (!seen.has(key) && product.rawTitle.length > 3) {
      seen.add(key);
      uniqueProducts.push(product);
    }
  }
  
  console.log(`✅ Extracted ${uniqueProducts.length} unique products from Ecometri`);
  
  return uniqueProducts;
}

/**
 * Extract Shopify products using products.json API
 */
async function extractShopifyProducts(storeUrl) {
  try {
    // Shopify provides a public JSON endpoint
    const baseUrl = new URL(storeUrl).origin;
    const productsJsonUrl = `${baseUrl}/products.json?limit=250`;
    
    console.log(`Fetching Shopify products from: ${productsJsonUrl}`);
    
    const response = await axios.get(productsJsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    const data = response.data;
    const products = [];
    
    if (data.products && Array.isArray(data.products)) {
      for (const product of data.products) {
        products.push({
          rawTitle: product.title || 'Producto sin título',
          rawDescription: stripHTML(product.body_html || ''),
          price: product.variants[0]?.price || '0',
          compareAtPrice: product.variants[0]?.compare_at_price || '',
          sku: product.variants[0]?.sku || '',
          imageUrl: product.images[0]?.src || '',
          images: product.images.map(img => img.src),
          vendor: product.vendor || '',
          productType: product.product_type || '',
          tags: product.tags ? product.tags.join(',') : '',
          sourceUrl: `${baseUrl}/products/${product.handle}`,
          detectedFromWeb: true
        });
      }
    }
    
    // Handle pagination if there are more products
    let page = 2;
    while (data.products && data.products.length === 250 && page <= 10) {
      try {
        const nextUrl = `${baseUrl}/products.json?limit=250&page=${page}`;
        const nextResponse = await axios.get(nextUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 30000
        });
        
        if (nextResponse.data.products && nextResponse.data.products.length > 0) {
          for (const product of nextResponse.data.products) {
            products.push({
              rawTitle: product.title || 'Producto sin título',
              rawDescription: stripHTML(product.body_html || ''),
              price: product.variants[0]?.price || '0',
              compareAtPrice: product.variants[0]?.compare_at_price || '',
              sku: product.variants[0]?.sku || '',
              imageUrl: product.images[0]?.src || '',
              images: product.images.map(img => img.src),
              vendor: product.vendor || '',
              productType: product.product_type || '',
              tags: product.tags ? product.tags.join(',') : '',
              sourceUrl: `${baseUrl}/products/${product.handle}`,
              detectedFromWeb: true
            });
          }
          page++;
        } else {
          break;
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message);
        break;
      }
    }
    
    return products;
    
  } catch (error) {
    console.error('Shopify extraction error:', error.message);
    throw error;
  }
}

/**
 * Extract WooCommerce products
 */
function extractWooCommerceProducts(html, baseUrl) {
  const $ = cheerio.load(html);
  const products = [];
  
  // Common WooCommerce selectors
  const productSelectors = [
    '.product',
    '.woocommerce-LoopProduct-link',
    'li.product',
    '.type-product'
  ];
  
  let productElements = $();
  for (const selector of productSelectors) {
    productElements = $(selector);
    if (productElements.length > 0) break;
  }
  
  productElements.each((index, element) => {
    const $product = $(element);
    
    const title = $product.find('.woocommerce-loop-product__title, h2, h3, .product-title').first().text().trim();
    const priceText = $product.find('.price .amount, .price, .woocommerce-Price-amount').first().text().trim();
    const image = $product.find('img').first().attr('src') || $product.find('img').first().attr('data-src');
    const link = $product.find('a').first().attr('href');
    
    if (title) {
      products.push({
        rawTitle: title,
        rawDescription: title,
        price: extractPrice(priceText),
        imageUrl: makeAbsoluteUrl(image, baseUrl),
        images: [makeAbsoluteUrl(image, baseUrl)],
        sourceUrl: makeAbsoluteUrl(link, baseUrl),
        detectedFromWeb: true
      });
    }
  });
  
  return products;
}

/**
 * Extract products from generic/unknown platforms
 */
function extractGenericProducts(html, baseUrl) {
  const $ = cheerio.load(html);
  const products = [];
  
  // Try to find product-like structures
  const possibleSelectors = [
    '[itemtype*="Product"]',
    '.product-item',
    '.product-card',
    '[data-product-id]',
    '.item',
    'article'
  ];
  
  let productElements = $();
  for (const selector of possibleSelectors) {
    productElements = $(selector);
    if (productElements.length > 0 && productElements.length < 200) {
      break;
    }
  }
  
  if (productElements.length === 0) {
    // Fallback: look for repeating image+text patterns
    $('img').each((index, img) => {
      const $img = $(img);
      const $parent = $img.closest('div, article, li, section');
      
      const title = $parent.find('h1, h2, h3, h4, .title, [class*="title"], [class*="name"]').first().text().trim();
      const priceText = $parent.find('[class*="price"], .price, [itemprop="price"]').first().text().trim();
      const image = $img.attr('src') || $img.attr('data-src');
      
      if (title && title.length > 5 && title.length < 200) {
        products.push({
          rawTitle: title,
          rawDescription: title,
          price: extractPrice(priceText) || '0',
          imageUrl: makeAbsoluteUrl(image, baseUrl),
          images: [makeAbsoluteUrl(image, baseUrl)],
          detectedFromWeb: true
        });
      }
    });
  } else {
    productElements.each((index, element) => {
      const $product = $(element);
      
      const title = $product.find('h1, h2, h3, h4, .title, [itemprop="name"]').first().text().trim();
      const description = $product.find('.description, [itemprop="description"], p').first().text().trim();
      const priceText = $product.find('[class*="price"], .price, [itemprop="price"]').first().text().trim();
      const image = $product.find('img').first().attr('src') || $product.find('img').first().attr('data-src');
      
      if (title && title.length > 3) {
        products.push({
          rawTitle: title,
          rawDescription: description || title,
          price: extractPrice(priceText) || '0',
          imageUrl: makeAbsoluteUrl(image, baseUrl),
          images: [makeAbsoluteUrl(image, baseUrl)],
          detectedFromWeb: true
        });
      }
    });
  }
  
  // Remove duplicates
  const uniqueProducts = [];
  const seen = new Set();
  
  for (const product of products) {
    const key = product.rawTitle.toLowerCase().trim();
    if (!seen.has(key) && product.rawTitle.length > 5) {
      seen.add(key);
      uniqueProducts.push(product);
    }
  }
  
  return uniqueProducts;
}

/**
 * Process product images: download and upload to Cloudinary
 */
async function processProductImages(products, batchId) {
  console.log(`☁️ Processing ${products.length} product images...`);
  
  const productsWithCloudinary = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      if (product.imageUrl && product.imageUrl.startsWith('http')) {
        // Download image
        const imageResponse = await axios.get(product.imageUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        // Convert to base64
        const base64Image = `data:image/jpeg;base64,${Buffer.from(imageResponse.data).toString('base64')}`;
        
        // Upload to Cloudinary
        const uploadResult = await uploadImagesBatch([base64Image], batchId);
        
        if (uploadResult[0]?.success) {
          productsWithCloudinary.push({
            ...product,
            imageUrl: uploadResult[0].url,
            cloudinaryOptimized: true
          });
        } else {
          productsWithCloudinary.push({
            ...product,
            cloudinaryOptimized: false
          });
        }
      } else {
        productsWithCloudinary.push({
          ...product,
          imageUrl: '',
          cloudinaryOptimized: false
        });
      }
      
      // Small delay to avoid rate limits
      if (i < products.length - 1 && i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`Error processing image for product ${i}:`, error.message);
      productsWithCloudinary.push({
        ...product,
        cloudinaryOptimized: false
      });
    }
  }
  
  console.log(`✅ Processed ${productsWithCloudinary.filter(p => p.cloudinaryOptimized).length}/${products.length} images`);
  
  return productsWithCloudinary;
}

/**
 * Helper: Strip HTML tags
 */
function stripHTML(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Helper: Extract price from text
 */
function extractPrice(priceText) {
  if (!priceText) return '0';
  
  const match = priceText.match(/[\d,]+\.?\d*/);
  if (match) {
    return match[0].replace(/,/g, '');
  }
  
  return '0';
}

/**
 * Helper: Make URL absolute
 */
function makeAbsoluteUrl(url, baseUrl) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  
  try {
    const base = new URL(baseUrl);
    return new URL(url, base.origin).href;
  } catch (error) {
    return url;
  }
}

module.exports = {
  scrapeStore,
  detectPlatform
};
