# AlfaEditorScan

Editor web local para diseñar etiquetas compatibles con AlfaScan y guardar layouts en SQL Server.

## Objetivo

`AlfaEditorScan` es un proyecto independiente de `AlfaScan`.

- `AlfaScan`: Android, React Native, Expo, Sunmi, escaneo e impresión.
- `AlfaEditorScan`: Web, React, Vite, PC/Desktop, diseño de etiquetas y exportacion.

`EditorScan` es la referencia oficial del layout y de la previsualización.
Lo que se ve en el editor debe coincidir con lo que AlfaScan mostrará en Preview.

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
  - `Gondola`
  - `Producto`
  - `Chico`
  - `Personalizado`
- Arrastrar y redimensionar elementos estilo Canva.
- Editar texto con una barra flotante contextual.
- Ver una previsualización que usa el mismo modelo visual que AlfaScan.
- Guardar el diseño en SQL Server mediante el API local.

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

Si necesitas un tamaño distinto, usa `Personalizado`.

### 2. Editar

Arrastra los elementos sobre el papel y usa la barra flotante contextual para cambiar el texto, el tamaño, la alineación y el estilo.

### 3. Guardar

Usa el botón `Guardar`.

El editor envía el diseño al flujo local del proyecto para escribir en:

- `dbo.Scan_Reporte`
- `dbo.Scan_ReporteDetalle`

Si la conexión SQL no está disponible, el editor muestra un mensaje claro y deja el flujo preparado.

## Persistencia local

El editor mantiene el estado visual mientras trabajas. La fuente de verdad del layout es `EditorScan`; el guardado solo persiste un modelo compatible con `dbo.Scan_Reporte` y `dbo.Scan_ReporteDetalle`.

## Configuración SQL Server

Crea o edita `.env.local` con estos datos:

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

Luego ejecuta:

```bash
npm run dev
```

Eso levanta:

- Vite en `http://localhost:5173`
- API local en `http://127.0.0.1:3001`

El botón `Guardar` usa ese API local para conectar a SQL Server.

## Roadmap

- Fase 1: editor local y guardado en SQL.
- Fase 2: abrir layouts existentes.
- Fase 3: API local opcional.
- Fase 4: guardado directo en SQL Server.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Convenciones de texto

- Todo texto del proyecto debe guardarse en UTF-8.
- Los mensajes visibles para el usuario deben escribirse con acentos y ortografía correctos.
- Evitar texto mal codificado, caracteres rotos o palabras truncadas.
- Si un cambio afecta UI, revisar que los labels, tooltips y estados sigan siendo legibles en español.


