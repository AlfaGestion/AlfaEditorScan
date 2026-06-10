# AlfaEditorScan

Editor web local para disenar etiquetas compatibles con AlfaScan y guardar layouts en SQL Server.

## Objetivo

`AlfaEditorScan` es un proyecto independiente de `AlfaScan`.

- `AlfaScan`: Android, React Native, Expo, Sunmi, escaneo e impresion.
- `AlfaEditorScan`: Web, React, Vite, PC/Desktop, diseno de etiquetas y exportacion.

`EditorScan` es la referencia oficial del layout y de la previsualizacion.
Lo que se ve en el editor debe coincidir con lo que AlfaScan mostrara en Preview.

Este editor no imprime, no escanea y no usa Sunmi.

Para guardar directamente en SQL Server usa el API local incluido en este repo.

## Requisitos

- Node.js 18 o superior.
- npm.

## Instalacion

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

## Que permite hacer

- Crear layouts para:
  - `Gondola`
  - `Producto`
  - `Chico`
  - `Personalizado`
- Arrastrar y redimensionar elementos estilo Canva.
- Editar texto con una barra flotante contextual.
- Ver una previsualizacion que usa el mismo modelo visual que AlfaScan.
- Guardar el diseno en SQL Server mediante el API local.

## Elementos soportados

- Empresa
- Descripcion
- Precio
- Codigo articulo
- Codigo barra
- Stock
- Fecha
- Texto fijo
- Linea
- Logo

## Flujo de trabajo

### 1. Crear formato

Elegi una plantilla en el selector de formato.

- `80 mm` equivale a `320 px`.
- `58 mm` equivale a `240 px`.
- `1 mm = 4 px`.

Si necesitas un tamano distinto, usa `Personalizado`.

### 2. Editar

Arrastra los elementos sobre el papel y usa la barra flotante contextual para cambiar el texto, el tamano, la alineacion y el estilo.

### 3. Guardar

Usa el boton `Guardar`.

El editor envia el diseno al flujo local del proyecto para escribir en:

- `dbo.Scan_Reporte`
- `dbo.Scan_ReporteDetalle`

Si la conexion SQL no esta disponible, el editor muestra un mensaje claro y deja el flujo preparado.

## Persistencia local

El editor mantiene el estado visual mientras trabajas. La fuente de verdad del layout es `EditorScan`; el guardado solo persiste un modelo compatible con `dbo.Scan_Reporte` y `dbo.Scan_ReporteDetalle`.

## Configuracion SQL Server

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

El boton `Guardar` usa ese API local para conectar a SQL Server.

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
