export const MM_TO_PX = 4
export const BASE_WIDTH_PX = 320
export const BASE_HEIGHT_PX = 240

export type FormatCode = 'gondola' | 'producto' | 'chico' | 'personalizado'
export type ElementType =
  | 'empresa'
  | 'descripcion'
  | 'precio'
  | 'codigoArticulo'
  | 'codigoBarra'
  | 'stock'
  | 'fecha'
  | 'textoFijo'
  | 'linea'
  | 'logo'

export type TextAlign = 'left' | 'center' | 'right'
export type FontWeight = 'normal' | 'bold'

export interface PaperFormat {
  codigo: FormatCode
  nombre: string
  anchoPapelMm: number
  altoPapelMm: number
  editable: boolean
}

export interface LabelDocument {
  codigo: FormatCode
  nombre: string
  anchoPapelMm: number
  altoPapelMm: number
  elementos: EditorElement[]
}

export interface EditorElement {
  id: string
  tipo: ElementType
  nombre: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontWeight: FontWeight
  align: TextAlign
  visible: boolean
  color: string
  text: string
  imageUrl: string
  lineHeight: number
}

export interface SampleData {
  empresa: string
  descripcion: string
  precio: string
  codigoArticulo: string
  codigoBarra: string
  stock: string
  fecha: string
}

export const sampleData: SampleData = {
  empresa: 'Nano Distribuciones',
  descripcion: 'Nivea Deo Aerosol B&W Fresh Sin Siliconas X 150 Ml.',
  precio: '$ 1.805,00',
  codigoArticulo: '10310',
  codigoBarra: '4005900985712',
  stock: '25',
  fecha: new Intl.DateTimeFormat('es-AR').format(new Date()),
}

export const paperFormats: PaperFormat[] = [
  {
    codigo: 'gondola',
    nombre: 'Góndola',
    anchoPapelMm: 80,
    altoPapelMm: 60,
    editable: false,
  },
  {
    codigo: 'producto',
    nombre: 'Producto',
    anchoPapelMm: 58,
    altoPapelMm: 40,
    editable: false,
  },
  {
    codigo: 'chico',
    nombre: 'Chico',
    anchoPapelMm: 40,
    altoPapelMm: 30,
    editable: false,
  },
  {
    codigo: 'personalizado',
    nombre: 'Personalizado',
    anchoPapelMm: 80,
    altoPapelMm: 60,
    editable: true,
  },
]

export const elementPalette: Array<{ tipo: ElementType; nombre: string; descripcion: string }> = [
  { tipo: 'empresa', nombre: 'Empresa', descripcion: 'Razón social o marca' },
  { tipo: 'descripcion', nombre: 'Descripción', descripcion: 'Nombre largo del producto' },
  { tipo: 'precio', nombre: 'Precio', descripcion: 'Importe destacado' },
  { tipo: 'codigoArticulo', nombre: 'Código artículo', descripcion: 'SKU o código interno' },
  { tipo: 'codigoBarra', nombre: 'Código barra', descripcion: 'EAN / UPC' },
  { tipo: 'stock', nombre: 'Stock', descripcion: 'Cantidad disponible' },
  { tipo: 'fecha', nombre: 'Fecha', descripcion: 'Fecha de impresión o lote' },
  { tipo: 'textoFijo', nombre: 'Texto fijo', descripcion: 'Etiqueta libre editable' },
  { tipo: 'linea', nombre: 'Línea', descripcion: 'Separador visual' },
  { tipo: 'logo', nombre: 'Logo', descripcion: 'Placeholder o imagen' },
]

export const STORAGE_KEY = 'alfa-editor-scan:document'

const defaultElementStyles = {
  color: '#111827',
  fontSize: 16,
  fontWeight: 'bold' as FontWeight,
  align: 'left' as TextAlign,
  visible: true,
  lineHeight: 1.1,
}

function uid(prefix = 'el'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function round(value: number): number {
  return Math.round(value)
}

export function mmToPx(mm: number): number {
  return round(mm * MM_TO_PX)
}

export function pxToMm(px: number): number {
  return round(px / MM_TO_PX)
}

export function getPaperFormat(codigo: FormatCode): PaperFormat {
  return paperFormats.find((format) => format.codigo === codigo) ?? paperFormats[0]
}

export function getCanvasSize(document: Pick<LabelDocument, 'anchoPapelMm' | 'altoPapelMm'>) {
  return {
    widthPx: mmToPx(document.anchoPapelMm),
    heightPx: mmToPx(document.altoPapelMm),
  }
}

function scaleElement(element: EditorElement, scaleX: number, scaleY: number): EditorElement {
  const averageScale = (scaleX + scaleY) / 2

  return {
    ...element,
    x: round(element.x * scaleX),
    y: round(element.y * scaleY),
    width: Math.max(24, round(element.width * scaleX)),
    height: Math.max(12, round(element.height * scaleY)),
    fontSize: Math.max(10, round(element.fontSize * averageScale)),
  }
}

function baseElements(): EditorElement[] {
  return [
    {
      id: uid(),
      tipo: 'logo',
      nombre: 'Logo',
      x: 16,
      y: 14,
      width: 64,
      height: 34,
      ...defaultElementStyles,
      fontSize: 11,
      fontWeight: 'bold',
      align: 'center',
      color: '#0f172a',
      text: 'LOGO',
      imageUrl: '',
      lineHeight: 1,
    },
    {
      id: uid(),
      tipo: 'empresa',
      nombre: 'Empresa',
      x: 88,
      y: 14,
      width: 210,
      height: 24,
      ...defaultElementStyles,
      fontSize: 18,
      fontWeight: 'bold',
      align: 'left',
      color: '#0f172a',
      text: '',
      imageUrl: '',
      lineHeight: 1,
    },
    {
      id: uid(),
      tipo: 'descripcion',
      nombre: 'Descripción',
      x: 16,
      y: 58,
      width: 288,
      height: 58,
      ...defaultElementStyles,
      fontSize: 15,
      fontWeight: 'normal',
      align: 'left',
      color: '#111827',
      text: '',
      imageUrl: '',
      lineHeight: 1.2,
    },
    {
      id: uid(),
      tipo: 'precio',
      nombre: 'Precio',
      x: 16,
      y: 122,
      width: 168,
      height: 50,
      ...defaultElementStyles,
      fontSize: 30,
      fontWeight: 'bold',
      align: 'left',
      color: '#0f172a',
      text: '',
      imageUrl: '',
      lineHeight: 1,
    },
    {
      id: uid(),
      tipo: 'codigoArticulo',
      nombre: 'Código artículo',
      x: 16,
      y: 182,
      width: 108,
      height: 22,
      ...defaultElementStyles,
      fontSize: 12,
      fontWeight: 'bold',
      align: 'left',
      color: '#334155',
      text: '',
      imageUrl: '',
      lineHeight: 1,
    },
    {
      id: uid(),
      tipo: 'codigoBarra',
      nombre: 'Código barra',
      x: 132,
      y: 182,
      width: 176,
      height: 22,
      ...defaultElementStyles,
      fontSize: 12,
      fontWeight: 'bold',
      align: 'left',
      color: '#334155',
      text: '',
      imageUrl: '',
      lineHeight: 1,
    },
    {
      id: uid(),
      tipo: 'stock',
      nombre: 'Stock',
      x: 16,
      y: 208,
      width: 70,
      height: 20,
      ...defaultElementStyles,
      fontSize: 12,
      fontWeight: 'bold',
      align: 'left',
      color: '#334155',
      text: '',
      imageUrl: '',
      lineHeight: 1,
    },
    {
      id: uid(),
      tipo: 'fecha',
      nombre: 'Fecha',
      x: 242,
      y: 208,
      width: 62,
      height: 20,
      ...defaultElementStyles,
      fontSize: 12,
      fontWeight: 'bold',
      align: 'right',
      color: '#334155',
      text: '',
      imageUrl: '',
      lineHeight: 1,
    },
  ]
}

function createScaledDocument(format: PaperFormat): LabelDocument {
  const canvas = getCanvasSize(format)
  const scaleX = canvas.widthPx / BASE_WIDTH_PX
  const scaleY = canvas.heightPx / BASE_HEIGHT_PX

  return {
    codigo: format.codigo,
    nombre: format.nombre,
    anchoPapelMm: format.anchoPapelMm,
    altoPapelMm: format.altoPapelMm,
    elementos: baseElements().map((element) => scaleElement(element, scaleX, scaleY)),
  }
}

export function createDefaultDocument(codigo: FormatCode = 'gondola'): LabelDocument {
  return createScaledDocument(getPaperFormat(codigo))
}

export function scaleDocumentToFormat(
  document: LabelDocument,
  format: PaperFormat,
): LabelDocument {
  const currentCanvas = getCanvasSize(document)
  const nextCanvas = getCanvasSize(format)

  const scaleX = nextCanvas.widthPx / currentCanvas.widthPx
  const scaleY = nextCanvas.heightPx / currentCanvas.heightPx

  return {
    codigo: format.codigo,
    nombre: format.nombre,
    anchoPapelMm: format.anchoPapelMm,
    altoPapelMm: format.altoPapelMm,
    elementos: document.elementos.map((element) => scaleElement(element, scaleX, scaleY)),
  }
}

function createElementDefaults(tipo: ElementType, index: number): EditorElement {
  const offset = index * 12
  const common = {
    id: uid(),
    tipo,
    nombre: getElementName(tipo),
    x: 20 + offset,
    y: 20 + offset,
    width: 160,
    height: 32,
    ...defaultElementStyles,
    fontSize: 14,
    fontWeight: 'bold' as FontWeight,
    align: 'left' as TextAlign,
    color: '#111827',
    text: '',
    imageUrl: '',
    lineHeight: 1.15,
  }

  switch (tipo) {
    case 'empresa':
      return { ...common, width: 200, height: 26, fontSize: 18 }
    case 'descripcion':
      return { ...common, width: 240, height: 52, fontSize: 15, fontWeight: 'normal' }
    case 'precio':
      return { ...common, width: 150, height: 48, fontSize: 30 }
    case 'codigoArticulo':
      return { ...common, width: 110, height: 20, fontSize: 12 }
    case 'codigoBarra':
      return { ...common, width: 170, height: 20, fontSize: 12 }
    case 'stock':
      return { ...common, width: 72, height: 20, fontSize: 12 }
    case 'fecha':
      return { ...common, width: 72, height: 20, fontSize: 12, align: 'right' }
    case 'textoFijo':
      return { ...common, width: 160, height: 28, fontSize: 14, text: 'Texto fijo' }
    case 'linea':
      return {
        ...common,
        width: 180,
        height: 2,
        fontSize: 12,
        fontWeight: 'normal',
        color: '#0f172a',
        lineHeight: 1,
      }
    case 'logo':
      return {
        ...common,
        width: 84,
        height: 42,
        fontSize: 11,
        fontWeight: 'bold',
        align: 'center',
        text: 'LOGO',
        color: '#0f172a',
      }
    default:
      return common
  }
}

export function addElement(document: LabelDocument, tipo: ElementType): LabelDocument {
  const element = createElementDefaults(tipo, document.elementos.length)
  const canvas = getCanvasSize(document)
  element.x = clamp(element.x, 0, Math.max(0, canvas.widthPx - element.width))
  element.y = clamp(element.y, 0, Math.max(0, canvas.heightPx - element.height))

  return {
    ...document,
    elementos: [...document.elementos, element],
  }
}

export function duplicateElement(document: LabelDocument, elementId: string): LabelDocument {
  const index = document.elementos.findIndex((element) => element.id === elementId)
  if (index < 0) return document

  const original = document.elementos[index]
  const duplicated: EditorElement = {
    ...original,
    id: uid(),
    x: original.x + 14,
    y: original.y + 14,
    nombre: `${original.nombre} copia`,
  }

  const canvas = getCanvasSize(document)
  duplicated.x = clamp(duplicated.x, 0, Math.max(0, canvas.widthPx - duplicated.width))
  duplicated.y = clamp(duplicated.y, 0, Math.max(0, canvas.heightPx - duplicated.height))

  const next = [...document.elementos]
  next.splice(index + 1, 0, duplicated)

  return { ...document, elementos: next }
}

export function removeElement(document: LabelDocument, elementId: string): LabelDocument {
  return {
    ...document,
    elementos: document.elementos.filter((element) => element.id !== elementId),
  }
}

export function updateElement(
  document: LabelDocument,
  elementId: string,
  patch: Partial<EditorElement>,
): LabelDocument {
  return {
    ...document,
    elementos: document.elementos.map((element) =>
      element.id === elementId ? { ...element, ...patch } : element,
    ),
  }
}

export function centerElement(document: LabelDocument, elementId: string): LabelDocument {
  const canvas = getCanvasSize(document)
  const element = getElementById(document, elementId)
  if (!element) return document

  return updateElement(document, elementId, {
    x: round((canvas.widthPx - element.width) / 2),
    y: round((canvas.heightPx - element.height) / 2),
  })
}

export function toggleVisibility(document: LabelDocument, elementId: string): LabelDocument {
  const element = getElementById(document, elementId)
  if (!element) return document
  return updateElement(document, elementId, { visible: !element.visible })
}

export function changeFontSize(
  document: LabelDocument,
  elementId: string,
  delta: number,
): LabelDocument {
  const element = getElementById(document, elementId)
  if (!element) return document

  const nextFontSize = clamp(element.fontSize + delta, 8, 64)
  return updateElement(document, elementId, {
    fontSize: nextFontSize,
    height: Math.max(12, round(nextFontSize * element.lineHeight + 12)),
  })
}

export function getElementById(document: LabelDocument, elementId: string): EditorElement | undefined {
  return document.elementos.find((element) => element.id === elementId)
}

export function getElementName(tipo: ElementType): string {
  switch (tipo) {
    case 'empresa':
      return 'Empresa'
    case 'descripcion':
      return 'Descripción'
    case 'precio':
      return 'Precio'
    case 'codigoArticulo':
      return 'Código artículo'
    case 'codigoBarra':
      return 'Código barra'
    case 'stock':
      return 'Stock'
    case 'fecha':
      return 'Fecha'
    case 'textoFijo':
      return 'Texto fijo'
    case 'linea':
      return 'Línea'
    case 'logo':
      return 'Logo'
  }
}

export function getElementDisplayValue(element: EditorElement, data: SampleData): string {
  switch (element.tipo) {
    case 'empresa':
      return data.empresa
    case 'descripcion':
      return data.descripcion
    case 'precio':
      return data.precio
    case 'codigoArticulo':
      return data.codigoArticulo
    case 'codigoBarra':
      return data.codigoBarra
    case 'stock':
      return data.stock
    case 'fecha':
      return data.fecha
    case 'textoFijo':
      return element.text || 'Texto fijo'
    case 'logo':
      return element.text || 'LOGO'
    case 'linea':
      return ''
  }
}

export function escapeSqlLiteral(value: string): string {
  return value.replaceAll("'", "''")
}

export function serializeDocument(document: LabelDocument): string {
  return JSON.stringify(document, null, 2)
}

export function parseDocumentJson(source: string, fallbackFormat: PaperFormat): LabelDocument {
  const parsed = JSON.parse(source) as Partial<LabelDocument> & {
    elementos?: unknown
    elements?: unknown
  }

  const elementosSource = Array.isArray(parsed.elementos)
    ? parsed.elementos
    : Array.isArray(parsed.elements)
      ? parsed.elements
      : []

  const elementos: EditorElement[] = elementosSource.map((item, index) => normalizeElement(item, index))

  if (elementos.length === 0) {
    throw new Error('El JSON no contiene elementos válidos.')
  }

  return {
    codigo: isFormatCode(parsed.codigo) ? parsed.codigo : fallbackFormat.codigo,
    nombre: typeof parsed.nombre === 'string' ? parsed.nombre : fallbackFormat.nombre,
    anchoPapelMm:
      typeof parsed.anchoPapelMm === 'number' ? parsed.anchoPapelMm : fallbackFormat.anchoPapelMm,
    altoPapelMm:
      typeof parsed.altoPapelMm === 'number' ? parsed.altoPapelMm : fallbackFormat.altoPapelMm,
    elementos,
  }
}

function isFormatCode(value: unknown): value is FormatCode {
  return value === 'gondola' || value === 'producto' || value === 'chico' || value === 'personalizado'
}

function normalizeElement(value: unknown, index: number): EditorElement {
  const item = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  const tipo = isElementType(item.tipo) ? item.tipo : 'textoFijo'

  return {
    id: typeof item.id === 'string' ? item.id : uid(`imported_${index}`),
    tipo,
    nombre: typeof item.nombre === 'string' ? item.nombre : getElementName(tipo),
    x: toNumber(item.x, 20 + index * 12),
    y: toNumber(item.y, 20 + index * 12),
    width: Math.max(24, toNumber(item.width, 120)),
    height: Math.max(12, toNumber(item.height, 24)),
    fontSize: clamp(toNumber(item.fontSize, 14), 8, 80),
    fontWeight: item.fontWeight === 'normal' ? 'normal' : 'bold',
    align: item.align === 'center' || item.align === 'right' ? item.align : 'left',
    visible: item.visible !== false,
    color: typeof item.color === 'string' ? item.color : '#111827',
    text: typeof item.text === 'string' ? item.text : '',
    imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
    lineHeight: clamp(toNumber(item.lineHeight, 1.15), 0.8, 2),
  }
}

function isElementType(value: unknown): value is ElementType {
  return (
    value === 'empresa' ||
    value === 'descripcion' ||
    value === 'precio' ||
    value === 'codigoArticulo' ||
    value === 'codigoBarra' ||
    value === 'stock' ||
    value === 'fecha' ||
    value === 'textoFijo' ||
    value === 'linea' ||
    value === 'logo'
  )
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function buildSqlScript(document: LabelDocument): string {
  const json = serializeDocument(document)
  const jsonLiteral = escapeSqlLiteral(json)
  const reportName = escapeSqlLiteral(document.nombre)
  const reportCode = escapeSqlLiteral(document.codigo)

  const detailRows = document.elementos
    .map((element, index) => {
      const config = escapeSqlLiteral(JSON.stringify(element, null, 2))
      return `  (@ReporteId, ${index + 1}, N'${escapeSqlLiteral(element.tipo)}', N'${escapeSqlLiteral(
        element.nombre,
      )}', ${round(element.x)}, ${round(element.y)}, ${round(element.width)}, ${round(
        element.height,
      )}, ${element.visible ? 1 : 0}, N'${config}')`
    })
    .join(',\n')

  return `SET NOCOUNT ON;
DECLARE @ReporteCodigo NVARCHAR(50) = N'${reportCode}';
DECLARE @ReporteNombre NVARCHAR(150) = N'${reportName}';
DECLARE @PrintFormatsJson NVARCHAR(MAX) = N'${jsonLiteral}';
DECLARE @ReporteId INT;

MERGE dbo.Scan_Reporte AS destino
USING (SELECT @ReporteCodigo AS Codigo) AS origen
ON destino.Codigo = origen.Codigo
WHEN MATCHED THEN
  UPDATE SET
    Nombre = @ReporteNombre,
    AnchoPapelMm = ${document.anchoPapelMm},
    AltoPapelMm = ${document.altoPapelMm},
    PrintFormatsJson = @PrintFormatsJson,
    FechaActualizacion = GETDATE()
WHEN NOT MATCHED THEN
  INSERT (Codigo, Nombre, AnchoPapelMm, AltoPapelMm, PrintFormatsJson, Activo, FechaActualizacion)
  VALUES (@ReporteCodigo, @ReporteNombre, ${document.anchoPapelMm}, ${document.altoPapelMm}, @PrintFormatsJson, 1, GETDATE());

SELECT @ReporteId = Id
FROM dbo.Scan_Reporte
WHERE Codigo = @ReporteCodigo;

DELETE FROM dbo.Scan_ReporteDetalle
WHERE IdReporte = @ReporteId;

INSERT INTO dbo.Scan_ReporteDetalle (
  IdReporte,
  Orden,
  Tipo,
  Titulo,
  X,
  Y,
  Ancho,
  Alto,
  Visible,
  ConfigJson
)
VALUES
${detailRows};

-- AlfaScan puede reutilizar el mismo JSON para PRINT_FORMATS_JSON.
`
}

export function buildFileName(document: LabelDocument, extension: string): string {
  const safeName = document.nombre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()

  return `${safeName || document.codigo}.${extension}`
}
