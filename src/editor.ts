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
  | 'codigoBarraTexto'
  | 'stock'
  | 'fecha'
  | 'textoFijo'
  | 'linea'
  | 'rectangulo'
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
  margenImpresion: PrintMargins
  activo: boolean
  esPredeterminado: boolean
  elementos: EditorElement[]
}

export interface PrintMargins {
  left: number
  top: number
  right: number
  bottom: number
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

export const DEFAULT_PRINT_MARGINS: PrintMargins = {
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
}

export type PlaceholderToken =
  | 'Empresa'
  | 'Descripcion'
  | 'Precio'
  | 'CodigoArticulo'
  | 'CodigoBarra'
  | 'Stock'
  | 'Fecha'

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
  { tipo: 'rectangulo', nombre: 'Rectángulo', descripcion: 'Marco o bloque visual' },
  { tipo: 'logo', nombre: 'Logo', descripcion: 'Placeholder o imagen' },
]

export const STORAGE_KEY = 'alfa-editor-scan:document'
export const logoLibrary = [
  { id: 'icono', label: 'Icono', src: '/logos/icono.png' },
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
  { value: 'Barcode', label: 'Barcode', fontFamily: '"Libre Barcode 128", monospace' },
] as const

export type TipoFuente = (typeof fontSourceOptions)[number]['value']

export function normalizeTipoFuente(value: unknown): TipoFuente {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized || normalized === 'default') return 'Default'
  const matched = fontSourceOptions.find((option) => option.value.toLowerCase() === normalized)
  if (matched) return matched.value
  if (normalized.includes('barcode')) return 'Barcode'
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
  if (normalized.includes('barcode')) return 'Barcode'
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

const DESIGN_LAYER_TYPES = new Set<ElementType>(['linea', 'rectangulo', 'logo'])

function uid(prefix = 'el'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function createFrameLine(base: EditorElement, patch: Partial<EditorElement>): EditorElement {
  return {
    ...base,
    ...patch,
    id: uid(),
  }
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

export function isDesignElementType(tipo: ElementType): boolean {
  return DESIGN_LAYER_TYPES.has(tipo)
}

export function getElementLayerLabel(element: Pick<EditorElement, 'tipo'>): 'Diseño' | 'Dato' {
  return isDesignElementType(element.tipo) ? 'Diseño' : 'Dato'
}

export function getCanvasSize(document: Pick<LabelDocument, 'anchoPapelMm' | 'altoPapelMm'>) {
  return {
    widthPx: mmToPx(document.anchoPapelMm),
    heightPx: mmToPx(document.altoPapelMm),
  }
}

export function normalizePrintMargins(
  margins: Partial<PrintMargins> | null | undefined,
  canvas?: { widthPx: number; heightPx: number },
): PrintMargins {
  const next = {
    left: Math.max(0, round(Number(margins?.left) || 0)),
    top: Math.max(0, round(Number(margins?.top) || 0)),
    right: Math.max(0, round(Number(margins?.right) || 0)),
    bottom: Math.max(0, round(Number(margins?.bottom) || 0)),
  }

  if (!canvas) return next

  const maxHorizontal = Math.max(0, canvas.widthPx - 24)
  const maxVertical = Math.max(0, canvas.heightPx - 24)

  if (next.left + next.right > maxHorizontal) {
    const ratio = maxHorizontal / Math.max(1, next.left + next.right)
    next.left = round(next.left * ratio)
    next.right = round(next.right * ratio)
  }

  if (next.top + next.bottom > maxVertical) {
    const ratio = maxVertical / Math.max(1, next.top + next.bottom)
    next.top = round(next.top * ratio)
    next.bottom = round(next.bottom * ratio)
  }

  return next
}

export function getPrintableArea(document: Pick<LabelDocument, 'anchoPapelMm' | 'altoPapelMm' | 'margenImpresion'>) {
  const canvas = getCanvasSize(document)
  const margins = normalizePrintMargins(document.margenImpresion, canvas)

  return {
    x: margins.left,
    y: margins.top,
    width: Math.max(24, canvas.widthPx - margins.left - margins.right),
    height: Math.max(24, canvas.heightPx - margins.top - margins.bottom),
    margins,
  }
}

function scaleElement(element: EditorElement, scaleX: number, scaleY: number): EditorElement {
  const averageScale = (scaleX + scaleY) / 2

  return {
    ...element,
    x: round(element.x * scaleX),
    y: round(element.y * scaleY),
    width: Math.max(element.tipo === 'linea' ? 2 : 24, round(element.width * scaleX)),
    height: Math.max(element.tipo === 'linea' ? 2 : 12, round(element.height * scaleY)),
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
    margenImpresion: { ...DEFAULT_PRINT_MARGINS },
    activo: true,
    esPredeterminado: false,
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
    margenImpresion: normalizePrintMargins(document.margenImpresion, nextCanvas),
    activo: document.activo,
    esPredeterminado: document.esPredeterminado,
    elementos: document.elementos.map((element) => scaleElement(element, scaleX, scaleY)),
  }
}

export function resizeDocumentPaper(
  document: LabelDocument,
  nextWidthMm: number,
  nextHeightMm: number,
  options: { scaleElements?: boolean; sourceSizeMm?: { widthMm: number; heightMm: number } } = {},
): LabelDocument {
  const safeWidthMm = clamp(Math.round(Number.isFinite(nextWidthMm) ? nextWidthMm : document.anchoPapelMm), 20, 120)
  const safeHeightMm = clamp(Math.round(Number.isFinite(nextHeightMm) ? nextHeightMm : document.altoPapelMm), 10, 120)
  const nextDocument = {
    ...document,
    codigo: 'custom' as FormatCode,
    anchoPapelMm: safeWidthMm,
    altoPapelMm: safeHeightMm,
  }

  const nextCanvas = getCanvasSize(nextDocument)
  const nextMargins = normalizePrintMargins(document.margenImpresion, nextCanvas)

  if (!options.scaleElements) {
    return {
      ...nextDocument,
      margenImpresion: nextMargins,
      elementos: [...document.elementos],
    }
  }

  const sourceWidthMm = Math.max(1, Math.round(options.sourceSizeMm?.widthMm ?? document.anchoPapelMm))
  const sourceHeightMm = Math.max(1, Math.round(options.sourceSizeMm?.heightMm ?? document.altoPapelMm))
  const currentCanvas = getCanvasSize({ anchoPapelMm: sourceWidthMm, altoPapelMm: sourceHeightMm })
  const scaleX = nextCanvas.widthPx / Math.max(1, currentCanvas.widthPx)
  const scaleY = nextCanvas.heightPx / Math.max(1, currentCanvas.heightPx)
  const averageScale = (scaleX + scaleY) / 2

  return {
    ...nextDocument,
    margenImpresion: nextMargins,
    elementos: document.elementos.map((element) => ({
      ...element,
      x: round(element.x * scaleX),
      y: round(element.y * scaleY),
      width: Math.max(element.tipo === 'linea' ? 2 : 24, round(element.width * scaleX)),
      height: Math.max(element.tipo === 'linea' ? 2 : 12, round(element.height * scaleY)),
      fontSize: Math.max(10, round(element.fontSize * averageScale)),
    })),
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
    case 'rectangulo':
      return {
        ...common,
        width: 120,
        height: 64,
        fontSize: 12,
        fontWeight: 'normal',
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

  const firstContentIndex = document.elementos.findIndex((item) => !isDesignElementType(item.tipo))
  const insertionIndex = isDesignElementType(tipo)
    ? firstContentIndex < 0
      ? document.elementos.length
      : firstContentIndex
    : document.elementos.length

  const next = [...document.elementos]
  next.splice(insertionIndex < 0 ? next.length : insertionIndex, 0, element)

  return {
    ...document,
    elementos: next,
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

export function moveElementToIndex(document: LabelDocument, elementId: string, nextIndex: number): LabelDocument {
  const currentIndex = document.elementos.findIndex((element) => element.id === elementId)
  if (currentIndex < 0) return document

  const clampedIndex = clamp(Math.round(nextIndex), 0, Math.max(0, document.elementos.length - 1))
  if (clampedIndex === currentIndex) return document

  const next = [...document.elementos]
  const [moved] = next.splice(currentIndex, 1)
  next.splice(clampedIndex, 0, moved)

  return {
    ...document,
    elementos: next,
  }
}

export function sendElementBackward(document: LabelDocument, elementId: string): LabelDocument {
  const currentIndex = document.elementos.findIndex((element) => element.id === elementId)
  if (currentIndex <= 0) return document
  return moveElementToIndex(document, elementId, currentIndex - 1)
}

export function bringElementForward(document: LabelDocument, elementId: string): LabelDocument {
  const currentIndex = document.elementos.findIndex((element) => element.id === elementId)
  if (currentIndex < 0 || currentIndex >= document.elementos.length - 1) return document
  return moveElementToIndex(document, elementId, currentIndex + 1)
}

export function sendElementToBack(document: LabelDocument, elementId: string): LabelDocument {
  return moveElementToIndex(document, elementId, 0)
}

export function bringElementToFront(document: LabelDocument, elementId: string): LabelDocument {
  return moveElementToIndex(document, elementId, document.elementos.length - 1)
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

export function stretchLineHorizontally(document: LabelDocument, elementId: string): LabelDocument {
  const canvas = getCanvasSize(document)
  const element = getElementById(document, elementId)
  if (!element || element.tipo !== 'linea') return document

  return updateElement(document, elementId, {
    x: 0,
    width: canvas.widthPx,
    height: Math.max(2, element.height),
  })
}

export function stretchLineVertically(document: LabelDocument, elementId: string): LabelDocument {
  const canvas = getCanvasSize(document)
  const element = getElementById(document, elementId)
  if (!element || element.tipo !== 'linea') return document

  return updateElement(document, elementId, {
    y: 0,
    width: Math.max(2, element.width),
    height: canvas.heightPx,
  })
}

export function convertLineToFrame(document: LabelDocument, elementId: string): LabelDocument {
  const element = getElementById(document, elementId)
  if (!element || element.tipo !== 'linea') return document

  const canvas = getCanvasSize(document)
  const thickness = Math.max(2, Math.min(element.width, element.height))
  const top = createFrameLine(element, { x: 0, y: 0, width: canvas.widthPx, height: thickness, nombre: 'Marco superior' })
  const bottom = createFrameLine(element, {
    x: 0,
    y: Math.max(0, canvas.heightPx - thickness),
    width: canvas.widthPx,
    height: thickness,
    nombre: 'Marco inferior',
  })
  const left = createFrameLine(element, { x: 0, y: 0, width: thickness, height: canvas.heightPx, nombre: 'Marco izquierdo' })
  const right = createFrameLine(element, {
    x: Math.max(0, canvas.widthPx - thickness),
    y: 0,
    width: thickness,
    height: canvas.heightPx,
    nombre: 'Marco derecho',
  })

  return {
    ...document,
    elementos: document.elementos.flatMap((item) => (item.id === elementId ? [top, bottom, left, right] : [item])),
  }
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
    case 'codigoBarraTexto':
      return 'Código barra texto'
    case 'stock':
      return 'Stock'
    case 'fecha':
      return 'Fecha'
    case 'textoFijo':
      return 'Texto fijo'
    case 'linea':
      return 'Línea'
    case 'rectangulo':
      return 'Rectángulo'
    case 'logo':
      return 'Logo'
  }
}

export function getElementDisplayValue(element: EditorElement, data: SampleData): string {
  const templateText = getElementTemplateText(element)
  if (templateText) {
    const value = replaceSqlPlaceholders(templateText, data)
    return element.uppercase ? value.toUpperCase() : value
  }

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
    case 'codigoBarraTexto':
      value = data.barcode
      break
    case 'stock':
      value = data.stock
      break
    case 'fecha':
      value = data.date
      break
    case 'textoFijo':
      value = 'Texto fijo'
      break
    case 'rectangulo':
      value = ''
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

export function getDefaultPlaceholderToken(tipo: ElementType): PlaceholderToken | null {
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
    case 'codigoBarraTexto':
      return 'CodigoBarra'
    case 'stock':
      return 'Stock'
    case 'fecha':
      return 'Fecha'
    case 'rectangulo':
      return null
    default:
      return null
  }
}

export function getPlaceholderForElement(element: Pick<EditorElement, 'tipo'>): string | null {
  const token = getDefaultPlaceholderToken(element.tipo)
  return token ? `{${token}}` : null
}

export function getElementTemplateText(element: Pick<EditorElement, 'tipo' | 'text'>): string | null {
  const customText = typeof element.text === 'string' ? element.text.trim() : ''
  if (customText) return element.text
  return getPlaceholderForElement(element)
}

export function parseTemplateAffixes(
  source: string,
  fallbackToken?: PlaceholderToken | null,
): { prefix: string; suffix: string; placeholder: string | null } {
  const normalized = typeof source === 'string' ? source : ''
  const match = normalized.match(/\{([^}]+)\}/)
  if (match) {
    return {
      prefix: normalized.slice(0, match.index ?? 0),
      suffix: normalized.slice((match.index ?? 0) + match[0].length),
      placeholder: match[0],
    }
  }

  return {
    prefix: normalized,
    suffix: '',
    placeholder: fallbackToken ? `{${fallbackToken}}` : null,
  }
}

export function buildTemplateText(prefix: string, placeholder: string | null, suffix: string): string {
  const nextPrefix = prefix ?? ''
  const nextSuffix = suffix ?? ''
  const nextPlaceholder = placeholder ?? ''
  return `${nextPrefix}${nextPlaceholder}${nextSuffix}`
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
    margenImpresion: normalizePrintMargins(parsed.margenImpresion),
    activo: typeof parsed.activo === 'boolean' ? parsed.activo : true,
    esPredeterminado: typeof parsed.esPredeterminado === 'boolean' ? parsed.esPredeterminado : false,
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
    width: Math.max(tipo === 'linea' ? 2 : 24, toNumber(item.width, 120)),
    height: Math.max(tipo === 'linea' ? 2 : 12, toNumber(item.height, 24)),
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
    value === 'codigoBarraTexto' ||
    value === 'stock' ||
    value === 'fecha' ||
    value === 'textoFijo' ||
    value === 'linea' ||
    value === 'rectangulo' ||
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
  const reportActivo = document.activo ? 1 : 0
  const reportEsPredeterminado = document.esPredeterminado ? 1 : 0

  const detailRows = document.elementos
    .map((element, index) => {
      const detalle = editorElementToSqlDetalle(element, index + 1)
      const campoLiteral = detalle.Campo === null ? 'NULL' : `N'${escapeSqlLiteral(detalle.Campo)}'`
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
DECLARE @Activo BIT = ${reportActivo};
DECLARE @EsPredeterminado BIT = ${reportEsPredeterminado};
DECLARE @ReporteId INT;

IF EXISTS (SELECT 1 FROM dbo.Scan_Reporte WHERE Codigo = @Codigo)
BEGIN
  UPDATE dbo.Scan_Reporte
  SET
    Nombre = @Nombre,
    Descripcion = @Descripcion,
    AnchoPapelMm = @AnchoPapelMm,
    AltoMm = @AltoMm,
    Activo = @Activo,
    EsPredeterminado = @EsPredeterminado,
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
    @Activo,
    @EsPredeterminado,
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

export type SqlTipoElemento = 'Dato' | 'texto' | 'precio' | 'codigobarra' | 'linea' | 'rectangulo'

export interface SqlDetalle {
  TipoElemento: SqlTipoElemento
  Campo: 'Empresa' | 'Descripcion' | 'Precio' | 'CodigoArticulo' | 'CodigoBarra' | 'Stock' | 'Fecha' | 'TextoFijo' | 'Logo' | null
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
  margenImpresion: PrintMargins
  activo: boolean
  esPredeterminado: boolean
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

function isBarcodeGraphicElement(element: Pick<EditorElement, 'tipo' | 'tipoFuente' | 'fontFamily'>): boolean {
  if (element.tipo !== 'codigoBarra') return false
  return normalizeTipoFuente(element.tipoFuente ?? element.fontFamily) === 'Barcode'
}

function getSqlFieldKey(element: Pick<EditorElement, 'tipo'>): Exclude<SqlDetalle['Campo'], 'TextoFijo' | 'Logo' | null> | null {
  switch (element.tipo) {
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
    case 'codigoBarraTexto':
      return 'CodigoBarra'
    case 'stock':
      return 'Stock'
    case 'fecha':
      return 'Fecha'
    default:
      return null
  }
}

function getSqlTipoElemento(element: EditorElement): SqlTipoElemento {
  switch (element.tipo) {
    case 'empresa':
      return 'Dato'
    case 'descripcion':
      return 'texto'
    case 'precio':
      return 'precio'
    case 'codigoBarra':
      return isBarcodeGraphicElement(element) ? 'codigobarra' : 'texto'
    case 'codigoBarraTexto':
      return 'texto'
    case 'linea':
      return 'linea'
    case 'rectangulo':
      return 'rectangulo'
    case 'textoFijo':
      return 'texto'
    default:
      return 'texto'
  }
}

function getSqlCampo(element: EditorElement): SqlDetalle['Campo'] {
  switch (element.tipo) {
    case 'empresa':
      return 'Empresa'
    case 'descripcion':
      return 'Descripcion'
    case 'precio':
      return 'Precio'
    case 'codigoArticulo':
      return 'CodigoArticulo'
    case 'codigoBarra':
    case 'codigoBarraTexto':
      return 'CodigoBarra'
    case 'stock':
      return 'Stock'
    case 'fecha':
      return 'Fecha'
    case 'linea':
      return 'TextoFijo'
    case 'textoFijo':
      return 'TextoFijo'
    case 'rectangulo':
      return null
    case 'logo':
      return 'Logo'
    default:
      return 'TextoFijo'
  }
}

function getSqlTextoFijo(element: EditorElement): string | null {
  if (element.tipo === 'linea') return '------------'
  if (element.tipo === 'rectangulo') return null
  if (element.tipo === 'textoFijo') return element.text && element.text.trim() ? element.text : null
  if (element.tipo === 'precio') return element.text && element.text.trim() ? element.text : null
  if (element.tipo === 'logo') return element.text || 'Logo'
  return null
}

function getSqlTipoFuente(element: EditorElement): string {
  if (element.tipo === 'codigoBarraTexto') return 'Arial'
  return normalizeTipoFuente(element.tipoFuente ?? element.fontFamily)
}

export function editorElementToSqlDetalle(element: EditorElement, order: number): SqlDetalle {
  return {
    TipoElemento: getSqlTipoElemento(element),
    Campo: getSqlCampo(element),
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

function isLegacyDescripcionPlaceholderDetail(detail: Partial<SqlDetalle>): boolean {
  const tipoElemento = String(detail.TipoElemento ?? '').trim().toLowerCase()
  const campo = String(detail.Campo ?? '').trim().toLowerCase()
  const textoFijo = String(detail.TextoFijo ?? '').trim()
  return tipoElemento === 'texto' && campo === 'textofijo' && textoFijo === '{descripcion}'
}

function isSqlFieldKey(value: string | null): value is NonNullable<ReturnType<typeof getSqlFieldKey>> {
  return value === 'Empresa' || value === 'Descripcion' || value === 'Precio' || value === 'CodigoArticulo' || value === 'CodigoBarra' || value === 'Stock' || value === 'Fecha'
}

export function sqlDetallesToEditorElements(details: Array<Partial<SqlDetalle> & { id?: string }>): EditorElement[] {
  const explicitDescriptionExists = details.some((detail) => {
    const tipoElemento = String(detail.TipoElemento ?? '').trim().toLowerCase()
    const campo = String(detail.Campo ?? '').trim().toLowerCase()
    return tipoElemento === 'texto' && campo === 'descripcion'
  })

  const seenFields = new Set<string>()
  const next: EditorElement[] = []

  details.forEach((detail, index) => {
    if (isLegacyDescripcionPlaceholderDetail(detail) && explicitDescriptionExists) {
      return
    }

    const nextDetail = isLegacyDescripcionPlaceholderDetail(detail)
      ? {
          ...detail,
          TipoElemento: 'texto' as const,
          Campo: 'Descripcion' as const,
          TextoFijo: null,
        }
      : detail

    const element = sqlDetalleToEditorElement(nextDetail, index)
    const fieldKey = getSqlFieldKey(element)
    if (isSqlFieldKey(fieldKey) && seenFields.has(fieldKey)) {
      return
    }
    if (isSqlFieldKey(fieldKey)) {
      seenFields.add(fieldKey)
    }
    next.push(element)
  })

  return next
}

export function normalizeDocumentForSql(document: LabelDocument): LabelDocument {
  const explicitDescriptionExists = document.elementos.some((element) => element.tipo === 'descripcion')
  const seenFields = new Set<NonNullable<ReturnType<typeof getSqlFieldKey>>>()
  const elementos: EditorElement[] = []

  for (const element of document.elementos) {
    if (element.tipo === 'textoFijo' && String(element.text ?? '').trim().toLowerCase() === '{descripcion}' && explicitDescriptionExists) {
      continue
    }

    const normalized: EditorElement = {
      ...element,
      x: Math.max(0, round(element.x)),
      y: Math.max(0, round(element.y)),
      width: Math.max(element.tipo === 'linea' ? 2 : 24, round(element.width)),
      height: Math.max(element.tipo === 'linea' ? 2 : 12, round(element.height)),
      text:
        element.tipo === 'descripcion'
          ? ''
          : element.tipo === 'textoFijo'
            ? (element.text ?? '').trim()
            : element.tipo === 'precio'
              ? (element.text ?? '').trim()
              : element.text,
    }

    if (normalized.tipo === 'textoFijo' && normalized.text.toLowerCase() === '{descripcion}' && explicitDescriptionExists) {
      continue
    }

    const fieldKey = getSqlFieldKey(normalized)
    if (fieldKey && seenFields.has(fieldKey)) {
      continue
    }
    if (fieldKey) {
      seenFields.add(fieldKey)
    }

    elementos.push(normalized)
  }

  return {
    ...document,
    elementos,
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
    const textoFijo = String(detail.TextoFijo ?? '').trim()
    const ancho = toNumber(detail.Ancho, 0)
    const alto = toNumber(detail.Alto, 0)

    if (tipoElemento === 'texto' && campo === 'textofijo' && textoFijo.length === 0 && ancho >= 40 && alto >= 40) {
      return 'rectangulo'
    }
    if (tipoElemento === 'dato' || campo === 'empresa') return 'empresa'
    if (tipoElemento === 'texto' && campo === 'descripcion') return 'descripcion'
    if (tipoElemento === 'precio') return 'precio'
    if (campo === 'codigoarticulo') return 'codigoArticulo'
    if (tipoElemento === 'codigobarra') return 'codigoBarra'
    if (tipoElemento === 'texto' && campo === 'codigobarra') return 'codigoBarra'
    if (campo === 'stock') return 'stock'
    if (campo === 'fecha') return 'fecha'
    if (tipoElemento === 'linea') return 'linea'
    if (tipoElemento === 'rectangulo') return 'rectangulo'
    if (tipoElemento === 'texto' && campo === 'textofijo') return 'textoFijo'
    if (tipoElemento === 'precio' || campo === 'precio') return 'precio'
    if (campo === 'textofijo' && textoFijo.length > 0) return 'textoFijo'
    if (campo === 'logo') return 'logo'
    return 'textoFijo'
  })()

  return {
    id: typeof detail.id === 'string' ? detail.id : uid(`imported_${index}`),
    tipo,
    nombre: getElementName(tipo),
    x: toNumber(detail.X, 0),
    y: toNumber(detail.Y, 0),
    width: Math.max(tipo === 'linea' ? 2 : tipo === 'rectangulo' ? 24 : 24, toNumber(detail.Ancho, 120)),
    height: Math.max(tipo === 'linea' ? 2 : tipo === 'rectangulo' ? 24 : 12, toNumber(detail.Alto, 24)),
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
        : tipo === 'rectangulo'
          ? ''
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
      displayValue: getElementDisplayValue(element, sampleData),
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
    margenImpresion: normalizePrintMargins(document.margenImpresion),
    activo: document.activo,
    esPredeterminado: document.esPredeterminado,
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
    const elementos = sqlDetallesToEditorElements(sqlRows as Array<Partial<SqlDetalle> & { id?: string }>)
    return {
      codigo: normalizeAlfaScanFormatCode(parsed.codigo),
      nombre: typeof parsed.nombre === 'string' ? parsed.nombre : fallbackFormat.nombre,
      anchoPapelMm:
        typeof parsed.anchoPapelMm === 'number' ? Number(parsed.anchoPapelMm) : fallbackFormat.anchoPapelMm,
      altoPapelMm:
        typeof parsed.altoPapelMm === 'number' ? Number(parsed.altoPapelMm) : fallbackFormat.altoPapelMm,
      margenImpresion: normalizePrintMargins((parsed as { margenImpresion?: Partial<PrintMargins> }).margenImpresion),
      activo: typeof parsed.activo === 'boolean' ? Boolean(parsed.activo) : true,
      esPredeterminado: typeof parsed.esPredeterminado === 'boolean' ? Boolean(parsed.esPredeterminado) : false,
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
    margenImpresion: normalizePrintMargins((parsed as { margenImpresion?: Partial<PrintMargins> }).margenImpresion),
    activo:
      typeof (parsed as { activo?: unknown }).activo === 'boolean' ? Boolean((parsed as { activo?: unknown }).activo) : true,
    esPredeterminado:
      typeof (parsed as { esPredeterminado?: unknown }).esPredeterminado === 'boolean'
        ? Boolean((parsed as { esPredeterminado?: unknown }).esPredeterminado)
        : false,
    elementos,
  }
}

export function buildAlfaScanSqlScript(document: LabelDocument): string {
  const layout = buildAlfaScanLayout(document, sampleData)
  const json = serializeAlfaScanDocument(document)
  const jsonLiteral = escapeSqlLiteral(json)
  const reportName = escapeSqlLiteral(layout.nombre)
  const reportCode = escapeSqlLiteral(layout.codigo)
  const reportActivo = document.activo ? 1 : 0
  const reportEsPredeterminado = document.esPredeterminado ? 1 : 0
  const detailRows = layout.items
    .map((item, index) => {
      const detalle = editorElementToSqlDetalle(item, index + 1)
      const campoLiteral = detalle.Campo === null ? 'NULL' : `N'${escapeSqlLiteral(detalle.Campo)}'`
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
DECLARE @MargenIzq INT = ${Math.max(0, Math.round(document.margenImpresion?.left || 0))};
DECLARE @MargenSub INT = ${Math.max(0, Math.round(document.margenImpresion?.top || 0))};
DECLARE @MargenDer INT = ${Math.max(0, Math.round(document.margenImpresion?.right || 0))};
DECLARE @MargenInf INT = ${Math.max(0, Math.round(document.margenImpresion?.bottom || 0))};
DECLARE @Activo BIT = ${reportActivo};
DECLARE @EsPredeterminado BIT = ${reportEsPredeterminado};
DECLARE @ReporteId INT;

IF EXISTS (SELECT 1 FROM dbo.Scan_Reporte WHERE Codigo = @Codigo)
BEGIN
  UPDATE dbo.Scan_Reporte
  SET
    Nombre = @Nombre,
    Descripcion = @Descripcion,
    AnchoPapelMm = @AnchoPapelMm,
    AltoMm = @AltoMm,
    MargenIzq = @MargenIzq,
    MargenSub = @MargenSub,
    MargenDer = @MargenDer,
    MargenInf = @MargenInf,
    Activo = @Activo,
    EsPredeterminado = @EsPredeterminado,
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
    MargenIzq,
    MargenSub,
    MargenDer,
    MargenInf,
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
    @MargenIzq,
    @MargenSub,
    @MargenDer,
    @MargenInf,
    @Activo,
    @EsPredeterminado,
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
