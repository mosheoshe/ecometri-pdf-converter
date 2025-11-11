/**
 * Generate CSV in Ecometri format (35 columns)
 * Based on Ecometri's official catalog import format
 */

/**
 * Ecometri CSV column headers (35 columns)
 */
const ECOMETRI_HEADERS = [
  'Nombre',                    // 1. Product name
  'Descripción',               // 2. Description
  'Categoría',                 // 3. Category
  'Subcategoría',              // 4. Subcategory
  'Precio',                    // 5. Price
  'Precio Comparación',        // 6. Compare at price
  'SKU',                       // 7. SKU
  'Código de Barras',          // 8. Barcode
  'Stock',                     // 9. Stock quantity
  'Peso (kg)',                 // 10. Weight
  'Largo (cm)',                // 11. Length
  'Ancho (cm)',                // 12. Width
  'Alto (cm)',                 // 13. Height
  'Imagen Principal',          // 14. Main image URL
  'Imagen 2',                  // 15. Image 2 URL
  'Imagen 3',                  // 16. Image 3 URL
  'Imagen 4',                  // 17. Image 4 URL
  'Imagen 5',                  // 18. Image 5 URL
  'Variante 1 Nombre',         // 19. Variant 1 name
  'Variante 1 Valor',          // 20. Variant 1 value
  'Variante 2 Nombre',         // 21. Variant 2 name
  'Variante 2 Valor',          // 22. Variant 2 value
  'Variante 3 Nombre',         // 23. Variant 3 name
  'Variante 3 Valor',          // 24. Variant 3 value
  'Estado',                    // 25. Status (activo/inactivo)
  'Marca',                     // 26. Brand
  'Proveedor',                 // 27. Supplier
  'Tags',                      // 28. Tags (comma separated)
  'Política de Envío',         // 29. Shipping policy
  'Política de Devolución',    // 30. Return policy
  'Destacado',                 // 31. Featured (sí/no)
  'Nuevo',                     // 32. New arrival (sí/no)
  'En Oferta',                 // 33. On sale (sí/no)
  'SEO Título',                // 34. SEO title
  'SEO Descripción'            // 35. SEO description
];

/**
 * Convert product data to Ecometri CSV row
 */
function productToCSVRow(product, index) {
  return {
    // 1-2: Basic info (AI enhanced)
    'Nombre': cleanCSVValue(product.title || product.rawTitle || `Producto ${index + 1}`),
    'Descripción': cleanCSVValue(product.description || product.rawDescription || product.title || ''),
    
    // 3-4: Categories (default values)
    'Categoría': 'General',
    'Subcategoría': '',
    
    // 5-6: Pricing (default values - user will update)
    'Precio': '0',
    'Precio Comparación': '',
    
    // 7-9: Inventory
    'SKU': `SKU-${Date.now()}-${index}`,
    'Código de Barras': '',
    'Stock': '0',
    
    // 10-13: Dimensions (default values)
    'Peso (kg)': '',
    'Largo (cm)': '',
    'Ancho (cm)': '',
    'Alto (cm)': '',
    
    // 14-18: Images (OPTIMIZED 1080x1080px WebP from Cloudinary)
    'Imagen Principal': product.imageUrl || '',
    'Imagen 2': '',
    'Imagen 3': '',
    'Imagen 4': '',
    'Imagen 5': '',
    
    // 19-24: Variants (empty by default)
    'Variante 1 Nombre': '',
    'Variante 1 Valor': '',
    'Variante 2 Nombre': '',
    'Variante 2 Valor': '',
    'Variante 3 Nombre': '',
    'Variante 3 Valor': '',
    
    // 25-27: Status and brand
    'Estado': 'activo',
    'Marca': '',
    'Proveedor': '',
    
    // 28-30: Policies
    'Tags': 'importado,pdf',
    'Política de Envío': '',
    'Política de Devolución': '',
    
    // 31-33: Flags
    'Destacado': 'no',
    'Nuevo': 'sí',
    'En Oferta': 'no',
    
    // 34-35: SEO (use product info)
    'SEO Título': cleanCSVValue(product.title || product.rawTitle || ''),
    'SEO Descripción': cleanCSVValue(product.description?.substring(0, 160) || product.title || '')
  };
}

/**
 * Clean CSV value (escape quotes and commas)
 */
function cleanCSVValue(value) {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // If contains comma, newline, or quote, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Generate complete Ecometri CSV from products array
 */
function generateEcometriCSV(products) {
  // Header row
  const headerRow = ECOMETRI_HEADERS.join(',');
  
  // Data rows
  const dataRows = products.map((product, index) => {
    const row = productToCSVRow(product, index);
    
    // Convert row object to CSV line in correct column order
    return ECOMETRI_HEADERS.map(header => {
      const value = row[header];
      // If value already contains quotes/commas, it's already cleaned
      if<span class="cursor">█</span>
