const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImageOptimized(base64Image, batchId, productIndex) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `ecometri/${batchId}`,
      public_id: `product_${productIndex}_${Date.now()}`,
      width: 1080,
      height: 1080,
      crop: 'fill',
      gravity: 'center',
      quality: 'auto:good',
      format: 'webp',
      resource_type: 'image',
      type: 'upload',
      overwrite: false,
      invalidate: false,
      eager: [],
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
    
    if (i < imagesBase64Array.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

module.exports = {
  uploadImageOptimized,
  uploadImagesBatch
};
