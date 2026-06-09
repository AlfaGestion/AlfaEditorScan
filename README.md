# AlfaEditorScan

Editor web local para diseñar etiquetas compatibles con AlfaScan y guardar layouts en SQL Server.

## Objetivo

`AlfaEditorScan` es un proyecto independiente de `AlfaScan`.

- `AlfaScan`: Android, React Native, Expo, Sunmi, escaneo e impresión.
- `AlfaEditorScan`: Web, React, Vite, PC/Desktop, diseño de etiquetas y exportación.

Este editor no imprime, no escanea y no usa Sunmi.

Para guardar directamente en SQL Server usa el API local incluido en este repo.

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
- Guardar directamente en SQL Server mediante el API local.
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

Usá `Guardar en SQL`, `Descargar SQL` o `Copiar SQL`.

`Guardar en SQL` conecta con el API local y escribe en la base de datos.

`Descargar SQL` solo baja el script para revisarlo o archivarlo.

El script se genera para una estructura compatible con:

- `dbo.Scan_Reporte`
- `dbo.Scan_ReporteDetalle`

Y reutiliza el mismo JSON para `PRINT_FORMATS_JSON`.

### 5. Importar luego en AlfaScan

El JSON exportado puede guardarse y luego reimportarse en AlfaScan como base de configuración de layouts.

## Persistencia local

El editor guarda automáticamente un borrador en `localStorage`.

Si querés compartir o versionar el diseño, exportá el JSON y guardalo en disco.

## Configuración SQL Server

Creá o editá `.env.local` con estos datos:

```env
SQL_SERVER=N15WI3256FHD\ALFANET
SQL_DATABASE=NANODISTRI
SQL_USER=TU_USUARIO
SQL_PASSWORD=TU_PASSWORD
SQL_PORT=1433
SQL_ENCRYPT=false
SQL_TRUST_SERVER_CERTIFICATE=true
SQL_API_PORT=3001
```

Luego ejecutá:

```bash
npm run dev
```

Eso levanta:

- Vite en `http://localhost:5173`
- API local en `http://127.0.0.1:3001`

El botón `Guardar en SQL` usa ese API local para conectar a SQL Server.

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
