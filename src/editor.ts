export const MM_TO_PX = 4
export const BASE_WIDTH_PX = 320
export const BASE_HEIGHT_PX = 240

export type FormatCode = 'gondola' | 'product' | 'small' | 'custom'
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
  fontStyle: 'normal' | 'italic'
  italica: boolean
  underline: boolean
  fontFamily: string
  uppercase: boolean
  align: TextAlign
  visible: boolean
  color: string
  text: string
  imageUrl: string
  lineHeight: number
  maxLineas: number
}

export interface SampleData {
  companyName: string
  description: string
  price: string
  internalCode: string
  barcode: string
  stock: string
  date: string
}

export const sampleData: SampleData = {
  companyName: 'Nano Distribuciones',
  description: 'Nivea Deo Aerosol B&W Fresh Sin Siliconas X 150 Ml.',
  price: '$ 1.805,00',
  internalCode: '10310',
  barcode: '4005900985712',
  stock: '25',
  date: new Intl.DateTimeFormat('es-AR').format(new Date()),
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
    codigo: 'product',
    nombre: 'Producto',
    anchoPapelMm: 58,
    altoPapelMm: 40,
    editable: false,
  },
  {
    codigo: 'small',
    nombre: 'Chico',
    anchoPapelMm: 58,
    altoPapelMm: 40,
    editable: false,
  },
  {
    codigo: 'custom',
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
  fontStyle: 'normal' as const,
  italica: false,
  underline: false,
  fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
  uppercase: false,
  align: 'left' as TextAlign,
  visible: true,
  lineHeight: 1.1,
  maxLineas: 1,
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
  const normalized = round(mm)
  if (normalized === 80) return 320
  if (normalized === 58) return 240
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
      fontStyle: 'normal',
      italica: false,
      underline: false,
      uppercase: false,
      fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
      fontStyle: 'normal',
      italica: false,
      underline: false,
      uppercase: false,
      fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
      fontStyle: 'normal',
      italica: false,
      underline: false,
      uppercase: false,
      fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
      fontStyle: 'normal',
      italica: false,
      underline: false,
      uppercase: false,
      fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
      fontStyle: 'normal',
      italica: false,
      underline: false,
      uppercase: false,
      fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
      fontStyle: 'normal',
      italica: false,
      underline: false,
      uppercase: false,
      fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
      fontStyle: 'normal',
      italica: false,
      underline: false,
      uppercase: false,
      fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
      fontStyle: 'normal',
      italica: false,
      underline: false,
      uppercase: false,
      fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
  const common: EditorElement = {
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
    fontStyle: 'normal',
    italica: false,
    underline: false,
    uppercase: false,
    fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
        fontStyle: 'normal',
        italica: false,
        underline: false,
        uppercase: false,
        fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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
        fontStyle: 'normal',
        italica: false,
        underline: false,
        uppercase: false,
        fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
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

export function alignElement(
  document: LabelDocument,
  elementId: string,
  align: 'left' | 'center' | 'right',
  marginPx = 16,
): LabelDocument {
  const canvas = getCanvasSize(document)
  const element = getElementById(document, elementId)
  if (!element) return document

  const x =
    align === 'left'
      ? marginPx
      : align === 'center'
        ? round((canvas.widthPx - element.width) / 2)
        : canvas.widthPx - element.width - marginPx

  return updateElement(document, elementId, {
    x: clamp(round(x), 0, Math.max(0, canvas.widthPx - element.width)),
  })
}

export function stretchElement(document: LabelDocument, elementId: string, marginPx = 16): LabelDocument {
  const canvas = getCanvasSize(document)
  const element = getElementById(document, elementId)
  if (!element) return document

  const width = Math.max(24, canvas.widthPx - marginPx * 2)
  return updateElement(document, elementId, {
    x: marginPx,
    width,
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
  let value = ''
  switch (element.tipo) {
    case 'empresa':
      value = data.companyName
      break
    case 'descripcion':
      value = data.description
      break
    case 'precio':
      value = data.price
      break
    case 'codigoArticulo':
      value = data.internalCode
      break
    case 'codigoBarra':
      value = data.barcode
      break
    case 'stock':
      value = data.stock
      break
    case 'fecha':
      value = data.date
      break
    case 'textoFijo':
      value = element.text || 'Texto fijo'
      break
    case 'logo':
      value = element.text || 'LOGO'
      break
    case 'linea':
      value = ''
      break
  }

  return element.uppercase ? value.toUpperCase() : value
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
    fontStyle: item.fontStyle === 'italic' ? 'italic' : 'normal',
    italica: item.italica === true || item.fontStyle === 'italic',
    underline: item.underline === true,
    fontFamily:
      typeof item.fontFamily === 'string' && item.fontFamily.trim()
        ? item.fontFamily
        : 'Aptos, Segoe UI, Arial, sans-serif',
    align: item.align === 'center' || item.align === 'right' ? item.align : 'left',
    visible: item.visible !== false,
    color: typeof item.color === 'string' ? item.color : '#111827',
    text: typeof item.text === 'string' ? item.text : '',
    imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
    lineHeight: clamp(toNumber(item.lineHeight, 1.15), 0.8, 2),
    uppercase: item.uppercase === true,
    maxLineas: Math.max(1, Math.round(toNumber(item.maxLineas, tipo === 'descripcion' ? 3 : tipo === 'textoFijo' ? 2 : 1))),
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
      const campo = getDetalleCampo(element.tipo)
      const textoFijo = getDetalleTextoFijo(element)
      const alineacion = element.align || 'left'
      const tipoElemento = escapeSqlLiteral(element.tipo)
      const campoLiteral = campo ? `N'${escapeSqlLiteral(campo)}'` : 'NULL'
      const textoFijoLiteral = textoFijo ? `N'${escapeSqlLiteral(textoFijo)}'` : 'NULL'

      return `  (@ReporteId, N'${tipoElemento}', ${campoLiteral}, ${textoFijoLiteral}, ${round(
        element.x,
      )}, ${round(element.y)}, ${round(element.width)}, ${round(element.height)}, ${round(
        element.fontSize,
      )}, ${element.fontWeight === 'bold' ? 1 : 0}, ${element.italica ? 1 : 0}, N'${escapeSqlLiteral(
        alineacion,
      )}', ${element.visible ? 1 : 0}, ${index + 1}, ${getDetalleMaxLineas(element)}, 0, GETDATE())`
    })
    .join(',\n')

  return `SET NOCOUNT ON;
DECLARE @Codigo NVARCHAR(50) = N'${reportCode}';
DECLARE @Nombre NVARCHAR(100) = N'${reportName}';
DECLARE @Descripcion NVARCHAR(250) = N'EditorScan';
DECLARE @AnchoPapelMm INT = ${document.anchoPapelMm};
DECLARE @AltoMm INT = ${document.altoPapelMm};
DECLARE @ReporteId INT;

IF EXISTS (SELECT 1 FROM dbo.Scan_Reporte WHERE Codigo = @Codigo)
BEGIN
  UPDATE dbo.Scan_Reporte
  SET
    Nombre = @Nombre,
    Descripcion = @Descripcion,
    AnchoPapelMm = @AnchoPapelMm,
    AltoMm = @AltoMm,
    Activo = 1,
    EsPredeterminado = 0,
    FechaModificacion = GETDATE()
  WHERE Codigo = @Codigo;
END
ELSE
BEGIN
  INSERT INTO dbo.Scan_Reporte (
    Codigo,
    Nombre,
    Descripcion,
    AnchoPapelMm,
    AltoMm,
    Activo,
    EsPredeterminado,
    FechaAlta,
    FechaModificacion
  )
  VALUES (
    @Codigo,
    @Nombre,
    @Descripcion,
    @AnchoPapelMm,
    @AltoMm,
    1,
    0,
    GETDATE(),
    GETDATE()
  );
END

SELECT @ReporteId = IdReporte
FROM dbo.Scan_Reporte
WHERE Codigo = @Codigo;

DELETE FROM dbo.Scan_ReporteDetalle
WHERE IdReporte = @ReporteId;

INSERT INTO dbo.Scan_ReporteDetalle (
  IdReporte,
  TipoElemento,
  Campo,
  TextoFijo,
  X,
  Y,
  Ancho,
  Alto,
  TamanoFuente,
  Negrita,
  Italica,
  Alineacion,
  Visible,
  Orden,
  MaxLineas,
  Mayuscula,
  FechaModificacion
)
VALUES
${detailRows};

-- JSON de referencia para AlfaScan:
-- ${jsonLiteral}
`
}

function getDetalleCampo(tipo: ElementType): string | null {
  switch (tipo) {
    case 'empresa':
      return 'Empresa'
    case 'descripcion':
      return 'Descripcion'
    case 'precio':
      return 'Precio'
    case 'codigoArticulo':
      return 'CodigoArticulo'
    case 'codigoBarra':
      return 'CodigoBarra'
    case 'stock':
      return 'Stock'
    case 'fecha':
      return 'Fecha'
    case 'textoFijo':
    case 'linea':
    case 'logo':
      return 'TextoFijo'
  }
}

function getDetalleTextoFijo(element: EditorElement): string | null {
  if (element.tipo === 'textoFijo') return element.text || 'Texto fijo'
  if (element.tipo === 'linea') return null
  if (element.tipo === 'logo') return element.text || 'Logo'
  return null
}

function getDetalleMaxLineas(element: EditorElement): number {
  return Math.max(1, Math.round(element.maxLineas || (element.tipo === 'descripcion' ? 3 : element.tipo === 'textoFijo' ? 2 : 1)))
}

export type AlfaScanTipoElemento = 'texto' | 'precio' | 'codigo_barra' | 'linea' | 'logo'

export interface AlfaScanLayoutItem extends EditorElement {
  campo: string
  tipoElemento: AlfaScanTipoElemento
  textoFijo: string | null
  displayValue: string
  order: number
  ancho: number
  alto: number
  tamanoFuente: number
  negrita: boolean
  alineacion: TextAlign
  visible: boolean
  maxLineas: number
  mayuscula: boolean
}

export interface AlfaScanLayout {
  codigo: FormatCode
  nombre: string
  anchoPapelMm: number
  altoPapelMm: number
  items: AlfaScanLayoutItem[]
}

function getAlfaScanCampo(tipo: ElementType): string {
  switch (tipo) {
    case 'empresa':
      return 'Empresa'
    case 'descripcion':
      return 'Descripcion'
    case 'precio':
      return 'Precio'
    case 'codigoArticulo':
      return 'CodigoArticulo'
    case 'codigoBarra':
      return 'CodigoBarra'
    case 'stock':
      return 'Stock'
    case 'fecha':
      return 'Fecha'
    case 'textoFijo':
      return 'TextoFijo'
    case 'linea':
      return 'TextoFijo'
    case 'logo':
      return 'Logo'
  }
}

function getAlfaScanTipoElemento(tipo: ElementType): AlfaScanTipoElemento {
  if (tipo === 'codigoBarra') return 'codigo_barra'
  if (tipo === 'precio') return 'precio'
  if (tipo === 'linea') return 'linea'
  if (tipo === 'logo') return 'logo'
  return 'texto'
}

function getAlfaScanDisplayValue(element: EditorElement, sampleData: SampleData): string {
  switch (element.tipo) {
    case 'empresa':
      return sampleData.companyName
    case 'descripcion':
      return sampleData.description
    case 'precio':
      return sampleData.price
    case 'codigoArticulo':
      return sampleData.internalCode
    case 'codigoBarra':
      return sampleData.barcode
    case 'stock':
      return sampleData.stock
    case 'fecha':
      return sampleData.date
    case 'textoFijo':
      return element.text || 'Texto fijo'
    case 'linea':
      return element.text || ''
    case 'logo':
      return element.text || 'Logo'
  }
}

export function buildAlfaScanLayout(document: LabelDocument, sampleData: SampleData): AlfaScanLayout {
  return {
    codigo: normalizeAlfaScanFormatCode(document.codigo),
    nombre: document.nombre,
    anchoPapelMm: document.anchoPapelMm,
    altoPapelMm: document.altoPapelMm,
    items: document.elementos.map((element, index) => ({
      ...element,
      campo: getAlfaScanCampo(element.tipo),
      tipoElemento: getAlfaScanTipoElemento(element.tipo),
      textoFijo:
        element.tipo === 'textoFijo'
          ? element.text || 'Texto fijo'
          : element.tipo === 'linea'
            ? null
            : element.tipo === 'logo'
              ? element.text || 'Logo'
              : null,
      displayValue: element.uppercase ? getAlfaScanDisplayValue(element, sampleData).toUpperCase() : getAlfaScanDisplayValue(element, sampleData),
      order: index + 1,
      x: round(element.x),
      y: round(element.y),
      ancho: round(element.width),
      alto: round(element.height),
      tamanoFuente: round(element.fontSize),
      negrita: element.fontWeight === 'bold',
      alineacion: element.align,
      visible: element.visible,
      maxLineas: getDetalleMaxLineas(element),
      mayuscula: element.uppercase,
    })),
  }
}

export interface SqlVerificationDetail {
  tipoElemento: string
  campo: string | null
  textoFijo: string | null
  x: number
  y: number
  ancho: number
  alto: number
  tamanoFuente: number
  negrita: boolean
  alineacion: string
  visible: boolean
  orden: number
  maxLineas: number
  mayuscula: boolean
}

export interface SqlVerificationSnapshot {
  codigo: string
  nombre: string
  anchoPapelMm: number
  altoMm: number | null
  detalles: SqlVerificationDetail[]
}

export function buildSqlVerificationSnapshot(document: LabelDocument): SqlVerificationSnapshot {
  const layout = buildAlfaScanLayout(document, sampleData)

  return {
    codigo: layout.codigo,
    nombre: layout.nombre,
    anchoPapelMm: layout.anchoPapelMm,
    altoMm: layout.altoPapelMm,
    detalles: layout.items.map((item) => ({
      tipoElemento: item.tipoElemento,
      campo: item.campo,
      textoFijo: item.textoFijo,
      x: item.x,
      y: item.y,
      ancho: item.ancho,
      alto: item.alto,
      tamanoFuente: item.tamanoFuente,
      negrita: item.negrita,
      alineacion: item.alineacion,
      visible: item.visible,
      orden: item.order,
      maxLineas: item.maxLineas,
      mayuscula: item.mayuscula,
    })),
  }
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

type AlfaScanFormatCode = 'gondola' | 'product' | 'small' | 'custom'

function normalizeAlfaScanFormatCode(value: unknown): AlfaScanFormatCode {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'producto') return 'product'
  if (normalized === 'chico') return 'small'
  if (normalized === 'personalizado') return 'custom'
  if (normalized === 'gondola' || normalized === 'product' || normalized === 'small' || normalized === 'custom') {
    return normalized
  }
  return 'gondola'
}

function mapAlfaScanElementToEditor(item: unknown, index: number): EditorElement {
  const source = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
  const key = String(source.key ?? source.valueKey ?? source.campo ?? source.Campo ?? '').trim().toLowerCase()
  const type = String(source.type ?? source.tipoElemento ?? source.TipoElemento ?? '').trim().toLowerCase()

  const tipo: ElementType = (() => {
    if (type === 'logo' || key === 'logo') return 'logo'
    if (type === 'codigo_barra' || type === 'barcode' || key === 'codigo_barra' || key === 'barcode') return 'codigoBarra'
    if (type === 'precio' || key === 'precio') return 'precio'
    if (type === 'texto' || key === 'texto' || key === 'texto fijo') return 'textoFijo'
    if (key === 'empresa' || key === 'companyname' || key === 'company_name') return 'empresa'
    if (key === 'descripcion' || key === 'description') return 'descripcion'
    if (key === 'precio' || key === 'price') return 'precio'
    if (key === 'codigoarticulo' || key === 'codigo_articulo' || key === 'internalcode' || key === 'code') return 'codigoArticulo'
    if (key === 'codigobarra' || key === 'codigo_barra' || key === 'barcode') return 'codigoBarra'
    if (key === 'stock') return 'stock'
    if (key === 'fecha' || key === 'date') return 'fecha'
    if (key === 'linea' || key === 'line' || key === 'separator') return 'linea'
    return 'textoFijo'
  })()

  const sampleText = String(source.sampleText ?? source.textoFijo ?? source.TextoFijo ?? source.text ?? source.Text ?? '').trim()

  return {
    id: typeof source.id === 'string' ? source.id : uid(`imported_${index}`),
    tipo,
    nombre: typeof source.label === 'string' ? source.label : getElementName(tipo),
    x: toNumber(source.x, 20 + index * 12),
    y: toNumber(source.y, 20 + index * 12),
    width: Math.max(24, toNumber(source.width, 120)),
    height: Math.max(12, toNumber(source.height, 24)),
    fontSize: clamp(toNumber(source.fontSize, 14), 8, 80),
    fontWeight: String(source.fontWeight ?? '400') === '700' ? 'bold' : 'normal',
    fontStyle: String(source.fontStyle ?? 'normal') === 'italic' ? 'italic' : 'normal',
    italica: source.italica === true || String(source.fontStyle ?? 'normal') === 'italic',
    underline: source.underline === true,
    fontFamily:
      typeof source.fontFamily === 'string' && source.fontFamily.trim()
        ? source.fontFamily
        : 'Aptos, Segoe UI, Arial, sans-serif',
    align: source.align === 'center' || source.align === 'right' ? (source.align as TextAlign) : 'left',
    visible: source.visible !== false,
    color: typeof source.color === 'string' ? source.color : '#111827',
    text: tipo === 'textoFijo' || tipo === 'linea' || tipo === 'logo' ? sampleText : '',
    imageUrl: typeof source.imageUrl === 'string' ? source.imageUrl : '',
    lineHeight: clamp(toNumber(source.lineHeight, 1.15), 0.8, 2),
    uppercase: source.uppercase === true,
    maxLineas: Math.max(1, Math.round(toNumber(source.maxLineas, tipo === 'descripcion' ? 3 : tipo === 'textoFijo' ? 2 : 1))),
  }
}

export function serializeAlfaScanDocument(document: LabelDocument): string {
  const layout = buildAlfaScanLayout(document, sampleData)
  return JSON.stringify(
    {
      codigo: layout.codigo,
      nombre: layout.nombre,
      anchoPapelMm: layout.anchoPapelMm,
      altoPapelMm: layout.altoPapelMm,
      elementos: layout.items.map((item) => ({
        TipoElemento: item.tipoElemento,
        Campo: item.campo,
        TextoFijo: item.textoFijo,
        X: item.x,
        Y: item.y,
        Ancho: item.ancho,
        Alto: item.alto,
        TamanoFuente: item.tamanoFuente,
        Negrita: item.negrita,
        Italica: item.italica,
        Alineacion: item.alineacion,
        Visible: item.visible,
        Orden: item.order,
        MaxLineas: item.maxLineas,
        Mayuscula: item.mayuscula,
      })),
    },
    null,
    2,
  )
}

export function parseAlfaScanDocumentJson(source: string, fallbackFormat: PaperFormat): LabelDocument {
  const parsed = JSON.parse(source) as Record<string, unknown>

  if (Array.isArray(parsed.elements) || Array.isArray(parsed.elementos)) {
    const elements: unknown[] = Array.isArray(parsed.elements)
      ? (parsed.elements as unknown[])
      : (parsed.elementos as unknown[])
    const elementos = elements.map((item, index) => mapAlfaScanElementToEditor(item, index))
    return {
      codigo: normalizeAlfaScanFormatCode(parsed.codigo),
      nombre: typeof parsed.nombre === 'string' ? parsed.nombre : fallbackFormat.nombre,
      anchoPapelMm:
        typeof parsed.anchoPapelMm === 'number' ? Number(parsed.anchoPapelMm) : fallbackFormat.anchoPapelMm,
      altoPapelMm:
        typeof parsed.altoPapelMm === 'number' ? Number(parsed.altoPapelMm) : fallbackFormat.altoPapelMm,
      elementos,
    }
  }

  const elementos = Array.isArray((parsed as { elementos?: unknown }).elementos)
    ? (parsed as { elementos: unknown[] }).elementos.map((item, index) => normalizeElement(item, index))
    : []

  if (elementos.length === 0) {
    throw new Error('El JSON no contiene elementos válidos.')
  }

  return {
    codigo: normalizeAlfaScanFormatCode((parsed as { codigo?: unknown }).codigo),
    nombre:
      typeof (parsed as { nombre?: unknown }).nombre === 'string'
        ? String((parsed as { nombre?: unknown }).nombre)
        : fallbackFormat.nombre,
    anchoPapelMm:
      typeof (parsed as { anchoPapelMm?: unknown }).anchoPapelMm === 'number'
        ? Number((parsed as { anchoPapelMm?: unknown }).anchoPapelMm)
        : fallbackFormat.anchoPapelMm,
    altoPapelMm:
      typeof (parsed as { altoPapelMm?: unknown }).altoPapelMm === 'number'
        ? Number((parsed as { altoPapelMm?: unknown }).altoPapelMm)
        : fallbackFormat.altoPapelMm,
    elementos,
  }
}

export function buildAlfaScanSqlScript(document: LabelDocument): string {
  const layout = buildAlfaScanLayout(document, sampleData)
  const json = serializeAlfaScanDocument(document)
  const jsonLiteral = escapeSqlLiteral(json)
  const reportName = escapeSqlLiteral(layout.nombre)
  const reportCode = escapeSqlLiteral(layout.codigo)
  const detailRows = layout.items
    .map((item) => {
      const campoLiteral = item.campo ? `N'${escapeSqlLiteral(item.campo)}'` : 'NULL'
      const textoFijoLiteral = item.textoFijo ? `N'${escapeSqlLiteral(item.textoFijo)}'` : 'NULL'

      return `  (@ReporteId, N'${item.tipoElemento}', ${campoLiteral}, ${textoFijoLiteral}, ${item.x}, ${item.y}, ${item.ancho}, ${item.alto}, ${item.tamanoFuente}, ${
        item.negrita ? 1 : 0
      }, ${item.italica ? 1 : 0}, N'${escapeSqlLiteral(item.alineacion)}', ${item.visible ? 1 : 0}, ${item.order}, ${item.maxLineas}, ${
        item.mayuscula ? 1 : 0
      }, GETDATE())`
    })
    .join(',\n')

  return `SET NOCOUNT ON;
DECLARE @Codigo NVARCHAR(50) = N'${reportCode}';
DECLARE @Nombre NVARCHAR(100) = N'${reportName}';
DECLARE @Descripcion NVARCHAR(250) = N'EditorScan';
DECLARE @AnchoPapelMm INT = ${document.anchoPapelMm};
DECLARE @AltoMm INT = ${document.altoPapelMm};
DECLARE @ReporteId INT;

IF EXISTS (SELECT 1 FROM dbo.Scan_Reporte WHERE Codigo = @Codigo)
BEGIN
  UPDATE dbo.Scan_Reporte
  SET
    Nombre = @Nombre,
    Descripcion = @Descripcion,
    AnchoPapelMm = @AnchoPapelMm,
    AltoMm = @AltoMm,
    Activo = 1,
    EsPredeterminado = 0,
    FechaModificacion = GETDATE()
  WHERE Codigo = @Codigo;
END
ELSE
BEGIN
  INSERT INTO dbo.Scan_Reporte (
    Codigo,
    Nombre,
    Descripcion,
    AnchoPapelMm,
    AltoMm,
    Activo,
    EsPredeterminado,
    FechaAlta,
    FechaModificacion
  )
  VALUES (
    @Codigo,
    @Nombre,
    @Descripcion,
    @AnchoPapelMm,
    @AltoMm,
    1,
    0,
    GETDATE(),
    GETDATE()
  );
END

SELECT @ReporteId = IdReporte
FROM dbo.Scan_Reporte
WHERE Codigo = @Codigo;

DELETE FROM dbo.Scan_ReporteDetalle
WHERE IdReporte = @ReporteId;

INSERT INTO dbo.Scan_ReporteDetalle (
  IdReporte,
  TipoElemento,
  Campo,
  TextoFijo,
  X,
  Y,
  Ancho,
  Alto,
  TamanoFuente,
  Negrita,
  Italica,
  Alineacion,
  Visible,
  Orden,
  MaxLineas,
  Mayuscula,
  FechaModificacion
)
VALUES
${detailRows};

-- JSON de referencia para AlfaScan:
-- ${jsonLiteral}
`
}



