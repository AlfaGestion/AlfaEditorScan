# AlfaEditorScan

Editor web local para diseñar etiquetas compatibles con AlfaScan.

## Objetivo

`AlfaEditorScan` es un proyecto independiente de `AlfaScan`.

- `AlfaScan`: Android, React Native, Expo, Sunmi, escaneo e impresión.
- `AlfaEditorScan`: Web, React, Vite, PC/Desktop, diseño de etiquetas y exportación.

Este editor no imprime, no escanea, no usa Sunmi y no requiere servidor.

## Requisitos

- Node.js 18 o superior.
- npm.

## Instalación

```bash
git clone https://github.com/AlfaGestion/AlfaEditorScan.git
cd AlfaEditorScan
npm install
npm run dev
```

Abrir:

```text
http://localhost:5173
```

## Qué permite hacer

- Crear layouts para:
  - `Góndola`
  - `Producto`
  - `Chico`
  - `Personalizado`
- Arrastrar y redimensionar elementos estilo Canva.
- Duplicar, eliminar, ocultar y centrar elementos.
- Agrandar y achicar texto.
- Alinear texto a izquierda, centro o derecha.
- Ver una vista previa con datos de ejemplo.
- Exportar JSON.
- Importar JSON.
- Generar script SQL Server 2008+ para `dbo.Scan_Reporte` y `dbo.Scan_ReporteDetalle`.
- Guardar un borrador local en el navegador.

## Elementos soportados

- Empresa
- Descripción
- Precio
- Código artículo
- Código barra
- Stock
- Fecha
- Texto fijo
- Línea
- Logo

## Flujo de trabajo

### 1. Crear formato

Elegí una plantilla en el selector de formato.

- `80 mm` equivale a `320 px`.
- `58 mm` equivale a `240 px`.
- `1 mm = 4 px`.

Si necesitás un tamaño distinto, usá `Personalizado`.

### 2. Editar

Arrastrá los elementos sobre el papel, ajustá tamaño y editá propiedades desde el panel derecho.

### 3. Exportar JSON

Usá `Descargar JSON` o `Copiar JSON`.

El formato exportado sigue esta idea:

```json
{
  "codigo": "gondola",
  "nombre": "Góndola",
  "anchoPapelMm": 80,
  "altoPapelMm": 60,
  "elementos": []
}
```

### 4. Generar SQL

Usá `Descargar SQL` o `Copiar SQL`.

El script se genera para una estructura compatible con:

- `dbo.Scan_Reporte`
- `dbo.Scan_ReporteDetalle`

Y reutiliza el mismo JSON para `PRINT_FORMATS_JSON`.

### 5. Importar luego en AlfaScan

El JSON exportado puede guardarse y luego reimportarse en AlfaScan como base de configuración de layouts.

## Persistencia local

El editor guarda automáticamente un borrador en `localStorage`.

Si querés compartir o versionar el diseño, exportá el JSON y guardalo en disco.

## Roadmap

- Fase 1: editor local, exportar JSON, generar SQL.
- Fase 2: abrir JSON e importar SQL.
- Fase 3: API local opcional.
- Fase 4: guardar directamente en SQL Server.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

