const ECOMETRI_HEADERS = [
  'Nombre', 'Descripción', 'Categoría', 'Subcategoría', 'Precio',
  'Precio Comparación', 'SKU', 'Código de Barras', 'Stock', 'Peso (kg)',
  'Largo (cm)', 'Ancho (cm)', 'Alto (cm)', 'Imagen Principal', 'Imagen 2',
  'Imagen 3', 'Imagen 4', 'Imagen 5', 'Variante 1 Nombre', 'Variante 1 Valor',
  'Variante 2 Nombre', 'Variante 2 Valor', 'Variante 3 Nombre', 'Variante 3 Valor',
  'Estado', 'Marca', 'Proveedor', 'Tags', 'Política de Envío',
  'Política de Devolución', 'Destacado', 'Nuevo', 'En Oferta',
  'SEO Título', 'SEO Descripción'
];

function cleanCSVValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function productToCSVRow(product, index) {
  return {
    'Nombre': cleanCSVValue(product.title || product.rawTitle || `Producto ${index + 1}`),
    'Descripción': cleanCSVValue(product.description || product.rawDescription || product.title || ''),
    'Categoría': 'General',
    'Subcategoría': '',
    'Precio': '0',
    'Precio Comparación': '',
    'SKU': `SKU-${Date.now()}-${index}`,
    'Código de Barras': '',
    'Stock': '0',
    'Peso (kg)': '',
    'Largo (cm)': '',
    'Ancho (cm)': '',
    'Alto (cm)': '',
    'Imagen Principal': product.imageUrl || '',
    'Imagen 2': '',
    'Imagen 3': '',
    'Imagen 4': '',
    'Imagen 5': '',
    'Variante 1 Nombre': '',
    'Variante 1 Valor': '',
    'Variante 2 Nombre': '',
    'Variante 2 Valor': '',
    'Variante 3 Nombre': '',
    'Variante 3 Valor': '',
    'Estado': 'activo',
    'Marca': '',
    'Proveedor': '',
    'Tags': 'importado,pdf',
    'Política de Envío': '',
    'Política de Devolución': '',
    'Destacado': 'no',
    'Nuevo': 'sí',
    'En Oferta': 'no',
    'SEO Título': cleanCSVValue(product.title || product.rawTitle || ''),
    'SEO Descripción': cleanCSVValue(product.description?.substring(0, 160) || product.title || '')
  };
}

function generateEcometriCSV(products) {
  const headerRow = ECOMETRI_HEADERS.join(',');
  const dataRows = products.map((product, index) => {
    const row = productToCSVRow(product, index);
    return ECOMETRI_HEADERS.map(header => {
      const value = row[header];
      if (typeof value === 'string' && value.startsWith('"')) {
        return value;
      }
      return cleanCSVValue(value);
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

function generateCSVMetadata(products, batchId) {
  return {
    filename: `ecometri_catalog_${batchId}_${Date.now()}.csv`,
    rowCount: products.length,
    columnCount: ECOMETRI_HEADERS.length,
    format: 'Ecometri 35 columns',
    encoding: 'UTF-8',
    delimiter: ',',
    generatedAt: new Date().toISOString(),
    productsSummary: {
      total: products.length,
      withImages: products.filter(p => p.imageUrl).length,
      withAI: products.filter(p => p.enhanced).length
    }
  };
}

module.exports = {
  generateEcometriCSV,
  generateCSVMetadata,
  productToCSVRow,
  ECOMETRI_HEADERS
};
