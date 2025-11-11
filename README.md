 1	# 🚀 Ecometri PDF → CSV Converter
     2	
     3	**Convierte catálogos PDF a CSV formato Ecometri - LISTO PARA USAR**
     4	
     5	![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
     6	![License](https://img.shields.io/badge/license-MIT-green.svg)
     7	![Status](https://img.shields.io/badge/status-ready-brightgreen.svg)
     8	
     9	---
    10	
    11	## ⚡ INICIO ULTRA-RÁPIDO
    12	
    13	### ✅ **SISTEMA CONFIGURADO CON TUS API KEYS**
    14	
    15	Abre: **`SISTEMA_CONFIGURADO.html`** para ver el estado completo
    16	
    17	### **SIN IMÁGENES** (0 configuración):
    18	1. Abre: **`standalone.html`**
    19	2. Arrastra tu PDF
    20	3. Descarga el CSV
    21	
    22	### **CON IMÁGENES** (backend configurado, requiere deployment):
    23	1. Lee: **`DEPLOYMENT_COMPLETO.md`** (guía paso a paso)
    24	2. Despliega en Render.com (15-20 min)
    25	3. Actualiza `config.js` con tu URL
    26	4. Abre `index.html` y procesa PDFs con imágenes automáticas
    27	
    28	**→ Lee:** [`TU_SISTEMA_LISTO.md`](TU_SISTEMA_LISTO.md) para resumen completo
    29	
    30	---
    31	
    32	## 📋 Descripción
    33	
    34	Convierte automáticamente catálogos PDF de productos a archivos CSV en el formato exacto de Ecometri (35 columnas).
    35	
    36	**✨ Características:**
    37	
    38	- 🎯 **Detección Inteligente de SKUs** - KA-, UK-, MK-, UBASS-, etc.
    39	- 📊 **Formato Exacto Ecometri** - 35 columnas en el orden correcto
    40	- 🖼️ **Con imágenes** (versión con backend) - Sube automáticamente a Cloudinary
    41	- 🤖 **IA integrada** (versión con backend) - Genera títulos y descripciones
    42	- 🔒 **100% Privado** (versión standalone) - Todo en tu navegador
    43	- ⚡ **Súper Rápido** - Procesa cientos de productos en segundos
    44	
    45	---
    46	
    47	## 🎯 2 Versiones Disponibles
    48	
    49	| Versión | Archivo | Imágenes | Configuración |
    50	|---------|---------|----------|---------------|
    51	| **Standalone** | `standalone.html` | ❌ No | ✅ Ninguna |
    52	| **Completa** | `index.html` | ✅ Sí | ⚠️ Requiere backend |
    53	
    54	**→ Lee:** [`PRODUCTO_LISTO_USAR.md`](PRODUCTO_LISTO_USAR.md) para comparación completa
    55	
    56	---
    57	
    58	## 🚀 Inicio Rápido
    59	
    60	### **PASO 1:** Abre este archivo primero
    61	
    62	```
    63	LEEME_PRIMERO.html
    64	```
    65	
    66	Te mostrará todas las opciones visualmente.
    67	
    68	---
    69	
    70	### **OPCIÓN A:** Versión Rápida (SIN configuración)
    71	
    72	```bash
    73	1. Doble clic en: standalone.html
    74	2. Arrastra tu PDF
    75	3. Descarga el CSV
    76	```
    77	
    78	**✅ Ventajas:** Funciona ahora mismo
    79	**❌ Limitación:** No incluye URLs de imágenes
    80	
    81	---
    82	
    83	### **OPCIÓN B:** Versión Completa (CON imágenes)
    84	
    85	**Necesitas API keys gratis:**
    86	- Cloudinary: https://cloudinary.com/users/register/free
    87	- Gemini AI: https://makersuite.google.com/app/apikey
    88	
    89	**Elige tu camino:**
    90	
    91	**1) Yo lo despliego por ti** ⭐ Recomendado
    92	- Dame tus API keys
    93	- Yo configuro todo el backend
    94	- Te doy el link listo para usar
    95	- Tiempo: 15 minutos
    96	
    97	**2) Lo haces tú mismo:**
    98	- Lee: [`INICIO_FACIL.md`](INICIO_FACIL.md)
    99	- Requiere instalar Node.js
   100	- Tiempo: 20-30 minutos
   101	
   102	---
   103	
   104	## 📚 Documentación
   105	
   106	| Archivo | Para Qué |
   107	|---------|----------|
   108	| **LEEME_PRIMERO.html** | 👁️ Inicio visual (abre primero) |
   109	| **standalone.html** | ⚡ Producto listo (sin imágenes) |
   110	| **EMPIEZA_AQUI.md** | 📖 Guía de inicio rápido |
   111	| **PRODUCTO_LISTO_USAR.md** | 📋 Documentación completa |
   112	| **RESUMEN_EJECUTIVO.md** | 📊 Resumen del proyecto |
   113	| **diagnostico.html** | 🔍 Diagnóstico de problemas |
   114	| **INICIO_FACIL.md** | 🔧 Configurar backend tú mismo |
   115	
   116	---
   117	
   118	## 🚨 ¿Problemas?
   119	
   120	**Si ves error "Backend no disponible":**
   121	
   122	1. Usa `diagnostico.html` para ver qué falla
   123	2. Lee [`SOLUCION_ERROR_BACKEND.md`](SOLUCION_ERROR_BACKEND.md)
   124	3. O simplemente usa `standalone.html` (funciona sin backend)
   125	
   126	### Opción 2: Ejecutar Localmente
   127	
   128	```bash
   129	# 1. Clonar o descargar este repositorio
   130	git clone https://github.com/tu-usuario/ecometri-converter.git
   131	cd ecometri-converter
   132	
   133	# 2. Abrir con un servidor local (opción A - Python)
   134	python3 -m http.server 8000
   135	
   136	# O (opción B - Node.js)
   137	npx http-server -p 8000
   138	
   139	# O (opción C - PHP)
   140	php -S localhost:8000
   141	
   142	# 3. Abrir en el navegador
   143	# http://localhost:8000
   144	```
   145	
   146	---
   147	
   148	## 📖 Cómo Usar
   149	
   150	### Paso 1: Subir PDF
   151	
   152	<img src="docs/step1-upload.png" alt="Subir PDF" width="600">
   153	
   154	- Arrastra y suelta tu catálogo PDF, o
   155	- Haz clic para seleccionar desde tu computadora
   156	- Máximo 50MB por archivo
   157	
   158	### Paso 2: Procesamiento Automático
   159	
   160	<img src="docs/step2-processing.png" alt="Procesamiento" width="600">
   161	
   162	El sistema automáticamente:
   163	- ✅ Extrae texto del PDF
   164	- ✅ Detecta SKUs y códigos de producto
   165	- ✅ Identifica nombres y descripciones
   166	- ✅ Agrupa por categorías
   167	- ✅ Busca precios (si existen)
   168	
   169	### Paso 3: Descargar Resultados
   170	
   171	<img src="docs/step3-results.png" alt="Resultados" width="600">
   172	
   173	- **Descarga el CSV** listo para Ecometri
   174	- **Descarga el reporte JSON** con estadísticas
   175	- **Revisa la vista previa** de los primeros 10 productos
   176	- **Verifica advertencias** (precios faltantes, etc.)
   177	
   178	---
   179	
   180	## 🛠️ Tecnologías
   181	
   182	Esta aplicación está construida con tecnologías 100% frontend:
   183	
   184	- **HTML5** - Estructura semántica
   185	- **CSS3** - Diseño responsive con gradientes y animaciones
   186	- **JavaScript (ES6+)** - Lógica de procesamiento
   187	- **PDF.js** - Biblioteca de Mozilla para parsear PDFs
   188	- **Font Awesome** - Iconos
   189	- **Google Fonts (Inter)** - Tipografía moderna
   190	
   191	**Sin dependencias de backend** - Todo funciona en el navegador
   192	
   193	---
   194	
   195	## 📊 Formato del CSV Generado
   196	
   197	El CSV tiene exactamente **35 columnas** en el formato Ecometri:
   198	
   199	| Columna | Completado Automático | Notas |
   200	|---------|----------------------|-------|
   201	| Nombre del producto | ✅ Sí | Extraído del PDF |
   202	| Referencia | ✅ Sí | SKU detectado |
   203	| Descripción | ✅ Sí | Generada automáticamente |
   204	| Categoría | ✅ Sí | Detectada por secciones |
   205	| Precio | ⚠️ Si existe en PDF | Completar manualmente si falta |
   206	| Estado | ✅ Sí | Activo (por defecto) |
   207	| Visibilidad | ✅ Sí | Visible (por defecto) |
   208	| Impuesto | ✅ Sí | 19% (por defecto) |
   209	| URL de imagen 1-4 | ❌ No | Agregar manualmente |
   210	| Otros campos | ❌ Vacíos | Completar según necesidad |
   211	
   212	---
   213	
   214	## 🔍 Detección de SKUs
   215	
   216	El sistema detecta automáticamente estos patrones de SKU:
   217	
   218	| Patrón | Ejemplo | Tipo de Producto |
   219	|--------|---------|------------------|
   220	| `KA-XXX` | KA-SWF-BL, KA-15T | Kala ukuleles |
   221	| `UK-XXX` | UK-CHERRYBOMB | Ukadelic series |
   222	| `MK-XXX` | MK-SD/LBLBURST | Makala series |
   223	| `UBASS-XXX` | UBASS-NOMAD-FS | U-BASS series |
   224	| `XX-XXX` | Cualquier formato genérico | Otros productos |
   225	
   226	---
   227	
   228	## ⚙️ Configuración Avanzada
   229	
   230	### Cambiar Valores por Defecto
   231	
   232	Edita `js/csv-generator.js`:
   233	
   234	```javascript
   235	this.defaults = {
   236	    impuesto: '19%',        // Cambiar % de impuesto
   237	    estado: 'Activo',       // Activo / Inactivo
   238	    visibilidad: 'Visible', // Visible / Oculto
   239	    unidad_peso: 'kg',      // kg / lb / g
   240	    envio_gratis: 'No',     // Sí / No
   241	    unidad_medida: 'cm'     // cm / in / m
   242	};
   243	```
   244	
   245	### Personalizar Detección de SKUs
   246	
   247	Edita `js/pdf-processor.js`:
   248	
   249	```javascript
   250	this.skuPatterns = [
   251	    /\b(TU-PATRON-[A-Z0-9]+)\b/g,  // Agregar tu patrón
   252	    // ... patrones existentes
   253	];
   254	```
   255	
   256	### Agregar Palabras a Ignorar
   257	
   258	```javascript
   259	this.ignoreKeywords = [
   260	    'TU_PALABRA',
   261	    // ... palabras existentes
   262	];
   263	```
   264	
   265	---
   266	
   267	## 📦 Estructura del Proyecto
   268	
   269	```
   270	ecometri-converter/
   271	├── index.html              # Página principal
   272	├── css/
   273	│   └── style.css          # Estilos y diseño
   274	├── js/
   275	│   ├── app.js             # Lógica de la aplicación
   276	│   ├── pdf-processor.js   # Procesador de PDF
   277	│   └── csv-generator.js   # Generador de CSV
   278	├── docs/                   # Documentación e imágenes
   279	├── README.md              # Este archivo
   280	└── LICENSE                # Licencia MIT
   281	```
   282	
   283	---
   284	
   285	## 🚢 Deployment
   286	
   287	### Opción 1: GitHub Pages (Gratis)
   288	
   289	```bash
   290	# 1. Subir el proyecto a GitHub
   291	git init
   292	git add .
   293	git commit -m "Initial commit"
   294	git remote add origin https://github.com/tu-usuario/ecometri-converter.git
   295	git push -u origin main
   296	
   297	# 2. En GitHub:
   298	# Settings → Pages → Source: main branch → Save
   299	
   300	# 3. Tu app estará en:
   301	# https://tu-usuario.github.io/ecometri-converter/
   302	```
   303	
   304	### Opción 2: Netlify (Gratis)
   305	
   306	1. Arrastra la carpeta del proyecto a [Netlify Drop](https://app.netlify.com/drop)
   307	2. ¡Listo! Tu app estará online en segundos
   308	
   309	### Opción 3: Vercel (Gratis)
   310	
   311	```bash
   312	npm i -g vercel
   313	vercel
   314	```
   315	
   316	### Opción 4: Tu Propio Servidor
   317	
   318	Sube todos los archivos a tu hosting (cPanel, FTP, etc.) y accede desde tu dominio.
   319	
   320	**Requisitos del servidor:**
   321	- Solo archivos estáticos (HTML, CSS, JS)
   322	- No requiere PHP, Node.js, Python, etc.
   323	- Compatible con cualquier hosting web
   324	
   325	---
   326	
   327	## 🔧 Troubleshooting
   328	
   329	### El PDF no se procesa
   330	
   331	**Problema:** PDF escaneado o sin texto seleccionable
   332	
   333	**Solución:** 
   334	- Verifica que puedas copiar texto del PDF
   335	- Usa herramientas OCR para convertir primero (Adobe Acrobat, Google Drive)
   336	
   337	### Faltan muchos productos
   338	
   339	**Problema:** SKUs no detectados
   340	
   341	**Solución:**
   342	- Revisa el patrón de SKUs en tu catálogo
   343	- Agrega el patrón personalizado (ver Configuración Avanzada)
   344	
   345	### Precios no detectados
   346	
   347	**Problema:** Formato de precio no reconocido
   348	
   349	**Solución:**
   350	- Completa los precios manualmente en Excel antes de importar
   351	- O edita `pricePatterns` en `pdf-processor.js`
   352	
   353	---
   354	
   355	## 🤝 Contribuir
   356	
   357	¡Las contribuciones son bienvenidas!
   358	
   359	1. Fork el proyecto
   360	2. Crea una rama (`git checkout -b feature/nueva-funcion`)
   361	3. Commit tus cambios (`git commit -m 'Agregar nueva función'`)
   362	4. Push a la rama (`git push origin feature/nueva-funcion`)
   363	5. Abre un Pull Request
   364	
   365	---
   366	
   367	## 📄 Licencia
   368	
   369	Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
   370	
   371	---
   372	
   373	## 👨‍💻 Autor
   374	
   375	**Ecometri Team**
   376	
   377	- Sitio Web: [ecometri.com](https://ecometri.com)
   378	- Email: support@ecometri.com
   379	
   380	---
   381	
   382	## 🙏 Agradecimientos
   383	
   384	- [PDF.js](https://mozilla.github.io/pdf.js/) por la biblioteca de procesamiento de PDFs
   385	- [Font Awesome](https://fontawesome.com/) por los iconos
   386	- [Google Fonts](https://fonts.google.com/) por la tipografía Inter
   387	
   388	---
   389	
   390	## 📝 Changelog
   391	
   392	### v1.0.0 (2024-11-11)
   393	
   394	**✨ Características Iniciales:**
   395	- Procesamiento de PDF con detección de SKUs
   396	- Generación de CSV en formato Ecometri (35 columnas)
   397	- Interfaz web moderna y responsive
   398	- Reportes JSON con estadísticas
   399	- Vista previa de productos
   400	- Sistema de advertencias
   401	
   402	---
   403	
   404	## 🔮 Roadmap
   405	
   406	### v1.1 (Próximamente)
   407	
   408	- [ ] Soporte para PDFs escaneados (OCR)
   409	- [ ] Extracción automática de imágenes
   410	- [ ] Subida de imágenes a Cloudinary
   411	- [ ] Edición en línea antes de descargar
   412	- [ ] Templates personalizados por industria
   413	- [ ] Integración directa con API de Ecometri
   414	
   415	### v1.2
   416	
   417	- [ ] Procesamiento por lotes (múltiples PDFs)
   418	- [ ] Machine Learning para mejorar detección
   419	- [ ] Historial de conversiones
   420	- [ ] Exportar a otros formatos (Excel, JSON)
   421	
   422	---
   423	
   424	## 💡 Tips Pro
   425	
   426	1. **Antes de importar:** Abre el CSV en Excel y verifica los primeros 10 productos
   427	2. **Precios faltantes:** Usa fórmulas de Excel para completar precios en batch
   428	3. **Categorías:** Revisa que las categorías detectadas tengan sentido
   429	4. **Imágenes:** Prepara URLs de imágenes en una columna de Excel para copiar/pegar
   430	5. **Backup:** Siempre guarda una copia de tu CSV antes de importar
   431	
   432	---
   433	
   434	## ❓ FAQ
   435	
   436	**P: ¿Necesito instalar algo?**  
   437	R: No, funciona directo en el navegador. Solo necesitas un navegador moderno (Chrome, Firefox, Safari, Edge).
   438	
   439	**P: ¿Mis PDFs se suben a un servidor?**  
   440	R: No, todo se procesa en tu navegador. Tus archivos nunca salen de tu computadora.
   441	
   442	**P: ¿Puedo usar esto comercialmente?**  
   443	R: Sí, está bajo licencia MIT. Puedes usarlo libremente.
   444	
   445	**P: ¿Funciona con catálogos en otros idiomas?**  
   446	R: Sí, funciona con cualquier idioma que use caracteres latinos.
   447	
   448	**P: ¿Cuántos productos puede procesar?**  
   449	R: Hemos probado con catálogos de hasta 500 productos sin problemas.
   450	
   451	---
   452	
   453	<div align="center">
   454	
   455	**¿Te gustó esta herramienta? ⭐ Dale una estrella en GitHub**
   456	
   457	[🐛 Reportar Bug](https://github.com/tu-usuario/ecometri-converter/issues) · 
   458	[✨ Solicitar Feature](https://github.com/tu-usuario/ecometri-converter/issues) · 
   459	[📖 Documentación](https://github.com/tu-usuario/ecometri-converter/wiki)
   460	
   461	</div>
   462	
   463	---
   464	
   465	**Hecho con ❤️ para la comunidad Ecometri**
   466	
