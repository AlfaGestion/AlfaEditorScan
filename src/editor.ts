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
  tipoFuente: string
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
export const logoLibrary = [
  { id: 'alfa_logo', label: 'Logo Alfa', src: '/logos/alfa_logo.png' },
  { id: 'alfa_new_logo_editable', label: 'Logo nuevo editable', src: '/logos/alfa_new_logo_editable.png' },
  { id: 'icon', label: 'Icono', src: '/logos/icon.png' },
  { id: 'adaptive_icon', label: 'Adaptive icon', src: '/logos/adaptive-icon.png' },
  { id: 'favicon', label: 'Favicon', src: '/logos/favicon.png' },
  { id: 'splash', label: 'Splash', src: '/logos/splash.png' },
  { id: 'splash_dark', label: 'Splash Dark', src: '/logos/splashDark.png' },
] as const

export const fontSourceOptions = [
  { value: 'Default', label: 'Default', fontFamily: 'Aptos, Segoe UI, Arial, sans-serif' },
  { value: 'Arial', label: 'Arial', fontFamily: 'Arial, Helvetica, sans-serif' },
  { value: 'Roboto', label: 'Roboto', fontFamily: 'Roboto, Arial, sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', fontFamily: '"Open Sans", Arial, sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', fontFamily: 'Montserrat, Arial, sans-serif' },
  { value: 'Poppins', label: 'Poppins', fontFamily: 'Poppins, Arial, sans-serif' },
  { value: 'Inter', label: 'Inter', fontFamily: 'Inter, Arial, sans-serif' },
  { value: 'Helvetica', label: 'Helvetica', fontFamily: 'Helvetica, Arial, sans-serif' },
  { value: 'Times New Roman', label: 'Times New Roman', fontFamily: '"Times New Roman", Times, serif' },
  { value: 'Georgia', label: 'Georgia', fontFamily: 'Georgia, Times, serif' },
  { value: 'Courier New', label: 'Courier New', fontFamily: '"Courier New", Courier, monospace' },
  { value: 'Consolas', label: 'Consolas', fontFamily: 'Consolas, Monaco, monospace' },
  { value: 'Monospace', label: 'Monospace', fontFamily: 'monospace' },
  { value: 'Barcode / Código de barra', label: 'Barcode / Código de barra', fontFamily: '"Libre Barcode 128 Text", monospace' },
] as const

export type TipoFuente = (typeof fontSourceOptions)[number]['value']

export function normalizeTipoFuente(value: unknown): TipoFuente {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized || normalized === 'default') return 'Default'
  const matched = fontSourceOptions.find((option) => option.value.toLowerCase() === normalized)
  if (matched) return matched.value
  if (normalized.includes('barcode')) return 'Barcode / Código de barra'
  if (normalized.includes('courier')) return 'Courier New'
  if (normalized.includes('consolas')) return 'Consolas'
  if (normalized.includes('times')) return 'Times New Roman'
  if (normalized.includes('georgia')) return 'Georgia'
  if (normalized.includes('monospace')) return 'Monospace'
  if (normalized.includes('montserrat')) return 'Montserrat'
  if (normalized.includes('poppins')) return 'Poppins'
  if (normalized.includes('open sans') || normalized.includes('opensans')) return 'Open Sans'
  if (normalized.includes('roboto')) return 'Roboto'
  if (normalized.includes('helvetica')) return 'Helvetica'
  if (normalized.includes('inter')) return 'Inter'
  if (normalized.includes('arial')) return 'Arial'
  return 'Default'
}

export function inferTipoFuente(fontFamily: unknown): TipoFuente {
  const normalized = String(fontFamily ?? '').trim().toLowerCase()
  if (!normalized) return 'Default'
  if (normalized.includes('barcode')) return 'Barcode / Código de barra'
  if (normalized.includes('courier')) return 'Courier New'
  if (normalized.includes('consolas')) return 'Consolas'
  if (normalized.includes('times new roman') || normalized.includes('times')) return 'Times New Roman'
  if (normalized.includes('georgia')) return 'Georgia'
  if (normalized.includes('monospace')) return 'Monospace'
  if (normalized.includes('montserrat')) return 'Montserrat'
  if (normalized.includes('poppins')) return 'Poppins'
  if (normalized.includes('open sans')) return 'Open Sans'
  if (normalized.includes('roboto')) return 'Roboto'
  if (normalized.includes('helvetica')) return 'Helvetica'
  if (normalized.includes('inter')) return 'Inter'
  if (normalized.includes('arial')) return 'Arial'
  return 'Default'
}

export function tipoFuenteToFontFamily(value: unknown): string {
  const normalized = normalizeTipoFuente(value)
  return fontSourceOptions.find((option) => option.value === normalized)?.fontFamily ?? fontSourceOptions[0].fontFamily
}

const defaultElementStyles = {
  color: '#111827',
  fontSize: 16,
  fontWeight: 'bold' as FontWeight,
  fontStyle: 'normal' as const,
  italica: false,
  underline: false,
  tipoFuente: 'Default' as TipoFuente,
  fontFamily: tipoFuenteToFontFamily('Default'),
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
      lineHeight: 1,
      fontStyle: 'normal',
      italica: false,
      underline: false,
      uppercase: false,
      fontFamily: 'Aptos, Segoe UI, Arial, sans-serif',
      imageUrl: logoLibrary[0].src,
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
    tipoFuente: 'Default',
    fontFamily: tipoFuenteToFontFamily('Default'),
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
        imageUrl: logoLibrary[0].src,
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
      value = replaceSqlPlaceholders(element.text || 'Texto fijo', data)
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

function replaceSqlPlaceholders(source: string, data: SampleData): string {
  const replacements: Record<string, string> = {
    codigoarticulo: data.internalCode,
    codigobarra: data.barcode,
    precio: data.price,
    empresa: data.companyName,
    descripcion: data.description,
    stock: data.stock,
    fecha: data.date,
  }

  return source.replace(/\{([^}]+)\}/g, (match, token) => {
    const replacement = replacements[String(token).trim().toLowerCase()]
    return replacement ?? match
  })
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
    tipoFuente: normalizeTipoFuente(item.tipoFuente ?? item.fontFamily),
    fontFamily: tipoFuenteToFontFamily(item.tipoFuente ?? item.fontFamily),
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
      const detalle = editorElementToSqlDetalle(element, index + 1)
      const textoFijoLiteral = detalle.TextoFijo === null ? 'NULL' : `N'${escapeSqlLiteral(detalle.TextoFijo)}'`
      const tipoFuenteLiteral = `N'${escapeSqlLiteral(detalle.TipoFuente || 'Default')}'`

      return `  (@ReporteId, N'${detalle.TipoElemento}', N'${escapeSqlLiteral(detalle.Campo)}', ${textoFijoLiteral}, ${tipoFuenteLiteral}, ${detalle.X}, ${detalle.Y}, ${detalle.Ancho}, ${detalle.Alto}, ${detalle.TamanoFuente}, ${
        detalle.Negrita ? 1 : 0
      }, ${detalle.Italica ? 1 : 0}, N'${escapeSqlLiteral(detalle.Alineacion)}', ${detalle.Visible ? 1 : 0}, ${detalle.Orden}, ${detalle.MaxLineas}, ${
        detalle.Mayuscula ? 1 : 0
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
  TipoFuente,
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

export type SqlTipoElemento = 'Dato' | 'texto' | 'precio' | 'codigobarra' | 'linea'

export interface SqlDetalle {
  TipoElemento: SqlTipoElemento
  Campo: 'Empresa' | 'Descripcion' | 'Precio' | 'CodigoArticulo' | 'CodigoBarra' | 'Stock' | 'Fecha' | 'TextoFijo' | 'Logo'
  TextoFijo: string | null
  TipoFuente: string
  X: number
  Y: number
  Ancho: number
  Alto: number
  TamanoFuente: number
  Negrita: boolean
  Italica: boolean
  Alineacion: TextAlign
  Visible: boolean
  Orden: number
  MaxLineas: number
  Mayuscula: boolean
}

export interface SqlVerificationDetail {
  tipoElemento: SqlTipoElemento
  campo: SqlDetalle['Campo']
  textoFijo: string | null
  tipoFuente: string
  x: number
  y: number
  ancho: number
  alto: number
  tamanoFuente: number
  negrita: boolean
  italica: boolean
  alineacion: TextAlign
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

export interface AlfaScanLayoutItem extends EditorElement {
  sqlDetalle: SqlDetalle
  displayValue: string
}

export interface AlfaScanLayout {
  codigo: FormatCode
  nombre: string
  anchoPapelMm: number
  altoPapelMm: number
  items: AlfaScanLayoutItem[]
}

function getSqlTipoElemento(tipo: ElementType): SqlTipoElemento {
  switch (tipo) {
    case 'empresa':
      return 'Dato'
    case 'descripcion':
      return 'texto'
    case 'precio':
      return 'precio'
    case 'codigoBarra':
      return 'codigobarra'
    case 'linea':
      return 'linea'
    case 'textoFijo':
      return 'texto'
    default:
      return 'texto'
  }
}

function getSqlCampo(tipo: ElementType): SqlDetalle['Campo'] {
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
    case 'linea':
      return 'TextoFijo'
    case 'textoFijo':
      return 'TextoFijo'
    case 'logo':
      return 'Logo'
    default:
      return 'TextoFijo'
  }
}

function getSqlTextoFijo(element: EditorElement): string | null {
  if (element.tipo === 'linea') return '------------'
  if (element.tipo === 'textoFijo') return element.text && element.text.trim() ? element.text : null
  return null
}

function getSqlTipoFuente(element: EditorElement): string {
  return normalizeTipoFuente(element.tipoFuente ?? element.fontFamily)
}

function getSqlDisplayValue(element: EditorElement, sampleData: SampleData): string {
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
      return replaceSqlPlaceholders(element.text || '', sampleData)
    case 'linea':
      return '------------'
    case 'logo':
      return element.text || 'Logo'
  }
}

export function editorElementToSqlDetalle(element: EditorElement, order: number): SqlDetalle {
  return {
    TipoElemento: getSqlTipoElemento(element.tipo),
    Campo: getSqlCampo(element.tipo),
    TextoFijo: getSqlTextoFijo(element),
    TipoFuente: getSqlTipoFuente(element),
    X: round(element.x),
    Y: round(element.y),
    Ancho: round(element.width),
    Alto: round(element.height),
    TamanoFuente: round(element.fontSize),
    Negrita: element.fontWeight === 'bold',
    Italica: element.italica || element.fontStyle === 'italic',
    Alineacion: element.align,
    Visible: element.visible,
    Orden: order,
    MaxLineas: Math.max(1, Math.round(element.maxLineas || (element.tipo === 'descripcion' ? 3 : element.tipo === 'textoFijo' ? 2 : 1))),
    Mayuscula: element.uppercase,
  }
}

export function sqlDetalleToEditorElement(detail: Partial<SqlDetalle> & { id?: string }, index = 0): EditorElement {
  const tipoFuente = normalizeTipoFuente(
    (detail as { TipoFuente?: unknown }).TipoFuente ??
      (detail as { tipoFuente?: unknown }).tipoFuente ??
      (detail as { fontFamily?: unknown }).fontFamily,
  )
  const tipo = (() => {
    const tipoElemento = String(detail.TipoElemento ?? '').trim().toLowerCase()
    const campo = String(detail.Campo ?? '').trim().toLowerCase()
    if (tipoElemento === 'dato' || campo === 'empresa') return 'empresa'
    if (tipoElemento === 'texto' && campo === 'descripcion') return 'descripcion'
    if (tipoElemento === 'precio') return 'precio'
    if (campo === 'codigoarticulo') return 'codigoArticulo'
    if (tipoElemento === 'codigobarra' || campo === 'codigobarra') return 'codigoBarra'
    if (campo === 'stock') return 'stock'
    if (campo === 'fecha') return 'fecha'
    if (tipoElemento === 'linea') return 'linea'
    if (tipoElemento === 'texto' && campo === 'textofijo') return 'textoFijo'
    if (campo === 'textofijo' && String(detail.TextoFijo ?? '').trim()) return 'textoFijo'
    if (campo === 'logo') return 'logo'
    return 'textoFijo'
  })()

  return {
    id: typeof detail.id === 'string' ? detail.id : uid(`imported_${index}`),
    tipo,
    nombre: getElementName(tipo),
    x: toNumber(detail.X, 0),
    y: toNumber(detail.Y, 0),
    width: Math.max(24, toNumber(detail.Ancho, 120)),
    height: Math.max(12, toNumber(detail.Alto, 24)),
    fontSize: clamp(toNumber(detail.TamanoFuente, 14), 8, 80),
    fontWeight: detail.Negrita ? 'bold' : 'normal',
    fontStyle: detail.Italica ? 'italic' : 'normal',
    italica: Boolean(detail.Italica),
    underline: false,
    tipoFuente: tipoFuente,
    fontFamily: tipoFuenteToFontFamily(tipoFuente),
    uppercase: Boolean(detail.Mayuscula),
    align: detail.Alineacion === 'center' || detail.Alineacion === 'right' ? detail.Alineacion : 'left',
    visible: detail.Visible !== false,
    color: '#111827',
    text:
      tipo === 'linea'
        ? '------------'
        : tipo === 'textoFijo'
          ? String(detail.TextoFijo ?? '')
          : '',
    imageUrl: '',
    lineHeight: 1.1,
    maxLineas: Math.max(1, Math.round(toNumber(detail.MaxLineas, tipo === 'descripcion' ? 3 : tipo === 'textoFijo' ? 2 : 1))),
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
      sqlDetalle: editorElementToSqlDetalle(element, index + 1),
      displayValue: getSqlDisplayValue(element, sampleData),
    })),
  }
}

export function buildSqlVerificationSnapshot(document: LabelDocument): SqlVerificationSnapshot {
  const layout = buildAlfaScanLayout(document, sampleData)

  return {
    codigo: layout.codigo,
    nombre: layout.nombre,
    anchoPapelMm: layout.anchoPapelMm,
    altoMm: layout.altoPapelMm,
    detalles: layout.items.map((item) => ({
      tipoElemento: item.sqlDetalle.TipoElemento,
      campo: item.sqlDetalle.Campo,
      textoFijo: item.sqlDetalle.TextoFijo,
      tipoFuente: item.sqlDetalle.TipoFuente,
      x: item.sqlDetalle.X,
      y: item.sqlDetalle.Y,
      ancho: item.sqlDetalle.Ancho,
      alto: item.sqlDetalle.Alto,
      tamanoFuente: item.sqlDetalle.TamanoFuente,
      negrita: item.sqlDetalle.Negrita,
      italica: item.sqlDetalle.Italica,
      alineacion: item.sqlDetalle.Alineacion,
      visible: item.sqlDetalle.Visible,
      orden: item.sqlDetalle.Orden,
      maxLineas: item.sqlDetalle.MaxLineas,
      mayuscula: item.sqlDetalle.Mayuscula,
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

export function serializeAlfaScanDocument(document: LabelDocument): string {
  const layout = buildAlfaScanLayout(document, sampleData)
  return JSON.stringify(
    {
      codigo: layout.codigo,
      nombre: layout.nombre,
      anchoPapelMm: layout.anchoPapelMm,
      altoPapelMm: layout.altoPapelMm,
      detalles: layout.items.map((item) => item.sqlDetalle),
      elementos: layout.items.map((item) => item.sqlDetalle),
    },
    null,
    2,
  )
}

export function parseAlfaScanDocumentJson(source: string, fallbackFormat: PaperFormat): LabelDocument {
  const parsed = JSON.parse(source) as Record<string, unknown>

  const sqlRows = Array.isArray((parsed as { detalles?: unknown }).detalles)
    ? ((parsed as { detalles: unknown[] }).detalles as unknown[])
    : Array.isArray(parsed.elements)
      ? (parsed.elements as unknown[])
      : Array.isArray(parsed.elementos)
        ? (parsed.elementos as unknown[])
        : []

  if (sqlRows.length > 0) {
    const elementos = sqlRows.map((item, index) => sqlDetalleToEditorElement(item as Partial<SqlDetalle>, index))
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
    .map((item, index) => {
      const detalle = editorElementToSqlDetalle(item, index + 1)
      const campoLiteral = `N'${escapeSqlLiteral(detalle.Campo)}'`
      const textoFijoLiteral = detalle.TextoFijo === null ? 'NULL' : `N'${escapeSqlLiteral(detalle.TextoFijo)}'`
      const tipoFuenteLiteral = `N'${escapeSqlLiteral(detalle.TipoFuente || 'Default')}'`

      return `  (@ReporteId, N'${detalle.TipoElemento}', ${campoLiteral}, ${textoFijoLiteral}, ${tipoFuenteLiteral}, ${detalle.X}, ${detalle.Y}, ${detalle.Ancho}, ${detalle.Alto}, ${detalle.TamanoFuente}, ${
        detalle.Negrita ? 1 : 0
      }, ${detalle.Italica ? 1 : 0}, N'${escapeSqlLiteral(detalle.Alineacion)}', ${detalle.Visible ? 1 : 0}, ${detalle.Orden}, ${detalle.MaxLineas}, ${
        detalle.Mayuscula ? 1 : 0
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
  TipoFuente,
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



