import { useEffect, useMemo, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Italic,
  Plus,
  Trash2,
  Type,
} from 'lucide-react'
import './App.css'
import {
  addElement,
  buildAlfaScanLayout,
  buildSqlVerificationSnapshot,
  createDefaultDocument,
  DEFAULT_PRINT_MARGINS,
  duplicateElement,
  getCanvasSize,
  getDefaultPlaceholderToken,
  getElementById,
  getElementLayerLabel,
  getElementName,
  getElementTemplateText,
  getPrintableArea,
  fontSourceOptions,
  inferTipoFuente,
  logoLibrary,
  bringElementForward,
  bringElementToFront,
  normalizeDocumentForSql,
  normalizePrintMargins,
  paperFormats,
  pxToMm,
  removeElement,
  sendElementBackward,
  sendElementToBack,
  resizeDocumentPaper,
  sqlDetallesToEditorElements,
  STORAGE_KEY,
  toggleVisibility,
  tipoFuenteToFontFamily,
  updateElement,
  type AlfaScanLayoutItem,
  type EditorElement,
  type FormatCode,
  type LabelDocument,
  type SampleData,
  type SqlVerificationSnapshot,
} from './editor'

type ToastKind = 'idle' | 'success' | 'error'

type ThemeMode = 'light' | 'dark'
type ViewMode = 'editor' | 'preview'
type SaveStatus = 'idle' | 'saving' | 'verifying' | 'verified' | 'error' | 'mismatch'

interface PersistedStateV2 {
  version: 2
  activeFormat: FormatCode
  documentsByFormat: Partial<Record<FormatCode, LabelDocument>>
  selectedIdsByFormat: Partial<Record<FormatCode, string>>
}

interface SqlConnectionConfig {
  server: string
  database: string
  user: string
  password: string
  port: number
  encrypt: boolean
  trustServerCertificate: boolean
}

interface SqlConnectionStatus {
  connected: boolean
  message: string
  databaseName?: string
  serverName?: string
  checkedAt?: string
}

interface LegacyPersistedState {
  document: LabelDocument
  selectedId: string
}

interface StoredEditorState {
  activeFormat: FormatCode
  document: LabelDocument
  documentsByFormat: Partial<Record<FormatCode, LabelDocument>>
  selectedIdsByFormat: Partial<Record<FormatCode, string>>
}

interface PreviewProduct {
  id: string
  companyName: string
  description: string
  price: string
  internalCode: string
  barcode: string
  stock: string
}

interface PreviewManualFields {
  companyName: string
  description: string
  price: string
  internalCode: string
  barcode: string
  stock: string
}

interface ElementMargins {
  leftPx: number
  topPx: number
  rightPx: number
  bottomPx: number
}

const BRAND_MARK_LOGO = '/logos/icono.png'
const THEME_STORAGE_KEY = 'alfa-editor-scan:theme'
type AddMenuKind = 'data' | 'design'

const DATA_ADD_OPTIONS: Array<{ tipo: EditorElement['tipo']; nombre: string; descripcion: string }> = [
  { tipo: 'empresa', nombre: 'Empresa', descripcion: 'Marca o razón social' },
  { tipo: 'descripcion', nombre: 'Descripción', descripcion: 'Texto descriptivo' },
  { tipo: 'precio', nombre: 'Precio', descripcion: 'Importe destacado' },
  { tipo: 'codigoBarra', nombre: 'Código de barra', descripcion: 'EAN o UPC' },
  { tipo: 'codigoArticulo', nombre: 'Código artículo', descripcion: 'SKU o código interno' },
  { tipo: 'stock', nombre: 'Stock', descripcion: 'Cantidad disponible' },
]

const DESIGN_ADD_OPTIONS: Array<{ tipo: EditorElement['tipo']; nombre: string; descripcion: string }> = [
  { tipo: 'textoFijo', nombre: 'Texto plano', descripcion: 'Etiqueta libre editable' },
  { tipo: 'linea', nombre: 'Línea', descripcion: 'Separador fino' },
  { tipo: 'linea', nombre: 'Separador', descripcion: 'Línea simple para dividir' },
  { tipo: 'rectangulo', nombre: 'Rectángulo / cuadrado', descripcion: 'Marco o bloque visual' },
  { tipo: 'logo', nombre: 'Logo', descripcion: 'Usa el icono Alfa' },
]

const TEXT_TEMPLATE_ELEMENT_TYPES = new Set<EditorElement['tipo']>([
  'textoFijo',
  'empresa',
  'descripcion',
  'precio',
  'codigoArticulo',
  'codigoBarra',
  'codigoBarraTexto',
  'stock',
  'fecha',
])

const TEMPLATE_QUICK_ACTIONS: Array<{
  label: string
  appliesTo: EditorElement['tipo'][]
  build: (placeholder: string) => string
}> = [
  { label: '$', appliesTo: ['precio', 'textoFijo'], build: (placeholder) => `$ ${placeholder}` },
  { label: '%', appliesTo: ['precio', 'stock', 'textoFijo'], build: (placeholder) => `${placeholder}%` },
  { label: 'Cod:', appliesTo: ['codigoArticulo', 'textoFijo'], build: (placeholder) => `Cod: ${placeholder}` },
  { label: 'Barra:', appliesTo: ['codigoBarra', 'codigoBarraTexto', 'textoFijo'], build: (placeholder) => `Barra: ${placeholder}` },
  { label: 'Stock:', appliesTo: ['stock', 'textoFijo'], build: (placeholder) => `Stock: ${placeholder}` },
]

const FALLBACK_QUICK_ACTIONS: Array<{
  label: string
  value: string
}> = [
  { label: '$', value: '$ ' },
  { label: '%', value: '%' },
  { label: 'Cod:', value: 'Cod: ' },
  { label: 'Barra:', value: 'Barra: ' },
  { label: 'Stock:', value: 'Stock: ' },
]

const fallbackPreviewCatalog: PreviewProduct[] = [
  {
    id: '10310',
    companyName: 'Nano Distribuciones',
    description: 'Nivea Deo Aerosol B&W Fresh Sin Siliconas X 150 Ml.',
    price: '$ 1.805,00',
    internalCode: '10310',
    barcode: '4005900985712',
    stock: '25',
  },
  {
    id: '10311',
    companyName: 'Nano Distribuciones',
    description: 'Rexona Women Clinical Clean X 150 Ml.',
    price: '$ 2.130,00',
    internalCode: '10311',
    barcode: '7791293012345',
    stock: '14',
  },
  {
    id: '21005',
    companyName: 'Alfa Gestión',
    description: 'Harina 0000 Pureza x 1 Kg.',
    price: '$ 912,50',
    internalCode: '21005',
    barcode: '7790070112344',
    stock: '54',
  },
]

function toPreviewSample(product: PreviewProduct): SampleData {
  return {
    companyName: product.companyName,
    description: product.description,
    price: product.price,
    internalCode: product.internalCode,
    barcode: product.barcode,
    stock: product.stock,
    date: new Intl.DateTimeFormat('es-AR').format(new Date()),
  }
}

function mergePreviewSample(product: PreviewProduct, manual: PreviewManualFields): SampleData {
  const fallback = toPreviewSample(product)
  return {
    companyName: manual.companyName.trim() || fallback.companyName,
    description: manual.description.trim() || fallback.description,
    price: manual.price.trim() || fallback.price,
    internalCode: manual.internalCode.trim() || fallback.internalCode,
    barcode: manual.barcode.trim() || fallback.barcode,
    stock: manual.stock.trim() || fallback.stock,
    date: fallback.date,
  }
}

function getPreviewTitle(product: PreviewProduct) {
  return product.companyName.trim() || product.description.trim() || product.internalCode.trim() || product.id
}

function normalizeFormatCode(value: string): FormatCode {
  switch (String(value ?? '').trim().toLowerCase()) {
    case 'producto':
      return 'product'
    case 'chico':
      return 'small'
    case 'personalizado':
      return 'custom'
    case 'gondola':
    case 'product':
    case 'small':
    case 'custom':
      return String(value).trim().toLowerCase() as FormatCode
    default:
      return 'gondola'
  }
}

function readStoredTheme(): ThemeMode {
  const raw = localStorage.getItem(THEME_STORAGE_KEY)
  if (raw === 'dark' || raw === 'light') return raw
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function reportToDocument(report: SqlVerificationSnapshot, fallbackFormat: FormatCode): LabelDocument {
  const fallbackDocument = createDefaultDocument(fallbackFormat)
  const elementos =
    Array.isArray(report.detalles) && report.detalles.length > 0
      ? sqlDetallesToEditorElements(
          [...report.detalles]
            .sort((left, right) => (left.orden ?? 0) - (right.orden ?? 0))
            .map((detail) => ({
              TipoElemento: detail.tipoElemento,
              Campo: detail.campo ?? undefined,
              TextoFijo: detail.textoFijo,
              TipoFuente: detail.tipoFuente,
              X: detail.x,
              Y: detail.y,
              Ancho: detail.ancho,
              Alto: detail.alto,
              TamanoFuente: detail.tamanoFuente,
              Negrita: detail.negrita,
              Italica: detail.italica,
              Alineacion: detail.alineacion,
              Visible: detail.visible,
              Orden: detail.orden,
              MaxLineas: detail.maxLineas,
              Mayuscula: detail.mayuscula,
            })),
        )
      : fallbackDocument.elementos

  return {
    codigo: normalizeFormatCode(report.codigo),
    nombre: typeof report.nombre === 'string' && report.nombre.trim() ? report.nombre : fallbackDocument.nombre,
    anchoPapelMm: typeof report.anchoPapelMm === 'number' ? Number(report.anchoPapelMm) : fallbackDocument.anchoPapelMm,
    altoPapelMm: typeof report.altoMm === 'number' ? Number(report.altoMm) : fallbackDocument.altoPapelMm,
    margenImpresion: normalizePrintMargins(report.margenImpresion ?? fallbackDocument.margenImpresion ?? DEFAULT_PRINT_MARGINS),
    activo: typeof report.activo === 'boolean' ? report.activo : fallbackDocument.activo,
    esPredeterminado:
      typeof report.esPredeterminado === 'boolean' ? report.esPredeterminado : fallbackDocument.esPredeterminado,
    elementos,
  }
}

function normalizeStoredDocument(document: LabelDocument): LabelDocument {
  const canvas = getCanvasSize(document)
  return {
    ...document,
    codigo: normalizeFormatCode(document.codigo),
    margenImpresion: normalizePrintMargins(document.margenImpresion, canvas),
    activo: document.activo !== false,
    esPredeterminado: document.esPredeterminado === true,
    elementos: (document.elementos || []).map((element) => ({
      ...element,
      fontStyle: element.fontStyle === 'italic' ? 'italic' : 'normal',
      italica: element.italica === true || element.fontStyle === 'italic',
      underline: Boolean(element.underline),
      tipoFuente: inferTipoFuente(element.tipoFuente || element.fontFamily),
      fontFamily: tipoFuenteToFontFamily(element.tipoFuente || element.fontFamily),
      uppercase: Boolean(element.uppercase),
      maxLineas: Number(element.maxLineas ?? 1),
    })),
  }
}

function normalizeStoredDocuments(
  documentsByFormat: Partial<Record<FormatCode, LabelDocument>>,
): Partial<Record<FormatCode, LabelDocument>> {
  return Object.entries(documentsByFormat).reduce<Partial<Record<FormatCode, LabelDocument>>>((acc, [key, value]) => {
    if (!value) return acc
    const formatKey = normalizeFormatCode(key)
    acc[formatKey] = normalizeStoredDocument(value)
    return acc
  }, {})
}

function createDocumentForFormat(codigo: FormatCode, existing?: LabelDocument): LabelDocument {
  if (existing) return normalizeStoredDocument(existing)
  return createDefaultDocument(codigo)
}

function readStoredState(): StoredEditorState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const document = createDefaultDocument('gondola')
    return {
      activeFormat: 'gondola',
      document,
      documentsByFormat: {
        gondola: document,
      },
      selectedIdsByFormat: {
        gondola: document.elementos[0]?.id ?? '',
      },
    }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedStateV2> & Partial<LegacyPersistedState>

    if (parsed.version === 2) {
      const normalizedDocuments = normalizeStoredDocuments(parsed.documentsByFormat || {})
      const activeFormat = normalizeFormatCode(parsed.activeFormat || 'gondola')
      const document =
        normalizedDocuments[activeFormat] ?? createDocumentForFormat(activeFormat, parsed.documentsByFormat?.[activeFormat])
      return {
        activeFormat,
        document,
        documentsByFormat: {
          ...normalizedDocuments,
          [activeFormat]: document,
        },
        selectedIdsByFormat: parsed.selectedIdsByFormat || {},
      }
    }

    if (parsed?.document?.elementos) {
      const document = normalizeStoredDocument(parsed.document)
      const activeFormat = normalizeFormatCode(document.codigo)
      return {
        activeFormat,
        document,
        documentsByFormat: {
          [activeFormat]: document,
        },
        selectedIdsByFormat: {
          [activeFormat]: parsed.selectedId || document.elementos[0]?.id || '',
        },
      }
    }
  } catch {
    // Fall through to default state.
  }

  const document = createDefaultDocument('gondola')
  return {
    activeFormat: 'gondola',
    document,
    documentsByFormat: {
      gondola: document,
    },
    selectedIdsByFormat: {
      gondola: document.elementos[0]?.id ?? '',
    },
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function supportsTemplateEditing(element?: Pick<EditorElement, 'tipo'> | null) {
  return Boolean(element && TEXT_TEMPLATE_ELEMENT_TYPES.has(element.tipo))
}

function getElementMargins(
  element: Pick<EditorElement, 'x' | 'y' | 'width' | 'height'>,
  canvas: { widthPx: number; heightPx: number },
): ElementMargins {
  return {
    leftPx: Math.max(0, Math.round(element.x)),
    topPx: Math.max(0, Math.round(element.y)),
    rightPx: Math.max(0, Math.round(canvas.widthPx - element.x - element.width)),
    bottomPx: Math.max(0, Math.round(canvas.heightPx - element.y - element.height)),
  }
}

function getFriendlySaveMismatchMessage(mismatches: Array<{ path: string; expected: unknown; actual: unknown }>) {
  if (!mismatches.length) return 'Guardado pendiente de verificación.'
  return 'No se pudo verificar el guardado. Revisar conexión o datos SQL.'
}

function getQuickActionsForElement(element: EditorElement | undefined, placeholder: string | null) {
  if (!element) return []

  const contextual = TEMPLATE_QUICK_ACTIONS.filter((action) => action.appliesTo.includes(element.tipo)).map((action) => ({
    label: action.label,
    value: action.build(placeholder || ''),
  }))

  if (contextual.length > 0) return contextual
  return FALLBACK_QUICK_ACTIONS
}

function formatSaveDebugLine(label: string, detail: unknown) {
  if (typeof detail === 'string') return `[SAVE_DEBUG] ${label}: ${detail}`
  try {
    return `[SAVE_DEBUG] ${label}: ${JSON.stringify(detail)}`
  } catch {
    return `[SAVE_DEBUG] ${label}: ${String(detail)}`
  }
}

function App() {
  const stored = useMemo(() => readStoredState(), [])
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readStoredTheme())
  const [sqlConnectionConfig, setSqlConnectionConfig] = useState<SqlConnectionConfig>({
    server: '',
    database: '',
    user: '',
    password: '',
    port: 1433,
    encrypt: false,
    trustServerCertificate: true,
  })
  const [sqlConnectionStatus, setSqlConnectionStatus] = useState<SqlConnectionStatus | null>(null)
  const [sqlConnectionLoading, setSqlConnectionLoading] = useState(false)
  const [sqlConnectionSaving, setSqlConnectionSaving] = useState(false)
  const [documentsByFormat, setDocumentsByFormat] = useState<Partial<Record<FormatCode, LabelDocument>>>(
    stored.documentsByFormat,
  )
  const [selectedIdsByFormat, setSelectedIdsByFormat] = useState<Partial<Record<FormatCode, string>>>(
    stored.selectedIdsByFormat,
  )
  const [activeFormat, setActiveFormat] = useState<FormatCode>(stored.activeFormat)
  const [documentState, setDocumentState] = useState<LabelDocument>(stored.document)
  const [selectedId, setSelectedId] = useState<string>(
    stored.selectedIdsByFormat[stored.activeFormat] ?? stored.document.elementos[0]?.id ?? '',
  )
  const [toast, setToast] = useState<{ kind: ToastKind; message: string }>({
    kind: 'idle',
    message: '',
  })
  const [editorZoom, setEditorZoom] = useState(1)
  const [previewZoom, setPreviewZoom] = useState(1)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [showAdvancedInspector, setShowAdvancedInspector] = useState(false)
  const [showSqlConnectionPanel, setShowSqlConnectionPanel] = useState(false)
  const [openAddMenu, setOpenAddMenu] = useState<AddMenuKind | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('editor')
  const [previewQuery, setPreviewQuery] = useState('')
  const [selectedPreviewId, setSelectedPreviewId] = useState('')
  const [previewProducts, setPreviewProducts] = useState<PreviewProduct[]>(fallbackPreviewCatalog)
  const [previewProductsLoading, setPreviewProductsLoading] = useState(false)
  const [previewProductsError, setPreviewProductsError] = useState('')
  const [previewProductsSource, setPreviewProductsSource] = useState('Muestra local')
  const [previewManualFields, setPreviewManualFields] = useState<PreviewManualFields>({
    companyName: '',
    description: '',
    price: '',
    internalCode: '',
    barcode: '',
    stock: '',
  })
  const addElementMenuRef = useRef<HTMLDivElement | null>(null)
  const formatLoadRequestRef = useRef(0)
  const paperResizeSourceRef = useRef<{ widthMm: number; heightMm: number }>({
    widthMm: stored.document.anchoPapelMm,
    heightMm: stored.document.altoPapelMm,
  })

  const canvas = getCanvasSize(documentState)
  const effectiveSelectedId = documentState.elementos.some((element) => element.id === selectedId)
    ? selectedId
    : documentState.elementos[0]?.id ?? ''
  const selectedElement = getElementById(documentState, effectiveSelectedId)
  const selectedPlaceholderToken = selectedElement ? getDefaultPlaceholderToken(selectedElement.tipo) : null
  const selectedPlaceholder = selectedPlaceholderToken ? `{${selectedPlaceholderToken}}` : null
  const selectedFieldLabel = selectedElement && supportsTemplateEditing(selectedElement) ? getElementName(selectedElement.tipo) : ''
  const selectedElementIndex = selectedElement ? documentState.elementos.findIndex((element) => element.id === selectedElement.id) : -1
  const selectedElementOrder = selectedElementIndex >= 0 ? selectedElementIndex + 1 : 0
  const selectedElementIsFirst = selectedElementIndex <= 0
  const selectedElementIsLast = selectedElementIndex < 0 || selectedElementIndex >= documentState.elementos.length - 1
  const selectedQuickActions = supportsTemplateEditing(selectedElement)
    ? getQuickActionsForElement(selectedElement ?? undefined, selectedPlaceholder)
    : []
  const selectedMargins = selectedElement ? getElementMargins(selectedElement, canvas) : null
  const printableArea = getPrintableArea({
    anchoPapelMm: documentState.anchoPapelMm,
    altoPapelMm: documentState.altoPapelMm,
    margenImpresion: documentState.margenImpresion ?? DEFAULT_PRINT_MARGINS,
  })
  const filteredPreviewProducts = useMemo(() => {
    const query = previewQuery.trim().toLowerCase()
    if (!query) return previewProducts
    return previewProducts.filter((product) => {
      return [product.id, product.companyName, product.description, product.internalCode, product.barcode]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [previewProducts, previewQuery])
  const selectedPreviewProduct =
    filteredPreviewProducts.find((product) => product.id === selectedPreviewId) ??
    filteredPreviewProducts[0] ??
    previewProducts[0] ??
    fallbackPreviewCatalog[0]
  const previewData = mergePreviewSample(selectedPreviewProduct, previewManualFields)
  const alfaScanLayout = useMemo(() => buildAlfaScanLayout(documentState, previewData), [documentState, previewData])
  const themeLabel = themeMode === 'dark' ? 'Modo oscuro' : 'Modo claro'
  const currentZoom = viewMode === 'editor' ? editorZoom : previewZoom
  const zoomLabel = `${Math.round(currentZoom * 100)}%`
  const sqlConnectionConnected = sqlConnectionStatus?.connected === true
  const sqlConnectionCheckedAt = sqlConnectionStatus?.checkedAt ?? ''
  const hasSqlConnectionStatus = sqlConnectionStatus !== null
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        activeFormat,
        documentsByFormat,
        selectedIdsByFormat,
      }),
    )
  }, [activeFormat, documentsByFormat, selectedIdsByFormat])

  useEffect(() => {
    if (toast.kind === 'idle') return
    const timeout = window.setTimeout(() => {
      setToast({ kind: 'idle', message: '' })
    }, 2200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    document.title = `AlfaEditorScan · ${documentState.nombre}`
  }, [documentState.nombre])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    document.documentElement.dataset.theme = themeMode
  }, [themeMode])

  useEffect(() => {
    if (saveStatus === 'idle' || saveStatus === 'saving' || saveStatus === 'verifying') return
    const timeout = window.setTimeout(() => {
      setSaveStatus('idle')
      setSaveMessage('')
    }, 2600)
    return () => window.clearTimeout(timeout)
  }, [saveStatus])

  useEffect(() => {
    if (!openAddMenu) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null
      if (target && addElementMenuRef.current && !addElementMenuRef.current.contains(target)) {
        setOpenAddMenu(null)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [openAddMenu])

  useEffect(() => {
    let cancelled = false

    async function loadSqlConnection() {
      setSqlConnectionLoading(true)
      try {
        const response = await fetch('/api/sql/connection')
        const payload = (await response.json().catch(() => ({}))) as {
          ok?: boolean
          config?: Partial<SqlConnectionConfig>
          connection?: SqlConnectionStatus
          error?: string
        }

        if (cancelled) return

        if (response.ok && payload.ok !== false && payload.config) {
          setSqlConnectionConfig((current) => ({
            server: payload.config?.server ?? current.server,
            database: payload.config?.database ?? current.database,
            user: payload.config?.user ?? current.user,
            password: payload.config?.password && payload.config.password !== '********' ? payload.config.password : current.password,
            port: Number(payload.config?.port ?? current.port) || current.port,
            encrypt: Boolean(payload.config?.encrypt ?? current.encrypt),
            trustServerCertificate:
              payload.config?.trustServerCertificate === undefined
                ? current.trustServerCertificate
                : Boolean(payload.config.trustServerCertificate),
          }))
          setSqlConnectionStatus(payload.connection || null)
          return
        }

        setSqlConnectionStatus({
          connected: false,
          message: payload.error || 'No se pudo leer la conexion.',
        })
      } catch (error) {
        if (cancelled) return
        setSqlConnectionStatus({
          connected: false,
          message: error instanceof Error ? error.message : 'No se pudo leer la conexion.',
        })
      } finally {
        if (!cancelled) {
          setSqlConnectionLoading(false)
        }
      }
    }

    loadSqlConnection()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadPreviewProducts() {
      if (!sqlConnectionConnected) {
        setPreviewProducts(fallbackPreviewCatalog)
        setPreviewProductsSource('Muestra local')
        setPreviewProductsError(hasSqlConnectionStatus ? 'La conexión SQL no está disponible.' : '')
        return
      }

      setPreviewProductsLoading(true)
      try {
        const response = await fetch('/api/sql/articles?limit=100')
        const payload = (await response.json().catch(() => ({}))) as {
          ok?: boolean
          articles?: PreviewProduct[]
          source?: { schemaName?: string; tableName?: string }
          message?: string
          error?: string
        }

        if (cancelled) return

        if (response.ok && payload.ok !== false && Array.isArray(payload.articles)) {
          const articles = payload.articles.length > 0 ? payload.articles : fallbackPreviewCatalog
          setPreviewProducts(articles)
          setPreviewProductsSource(
            payload.source?.schemaName && payload.source?.tableName
              ? `${payload.source.schemaName}.${payload.source.tableName}`
              : 'Base de datos',
          )
          setPreviewProductsError(payload.articles.length > 0 ? '' : payload.message || 'No se encontraron artículos.')
          setSelectedPreviewId((current) => {
            if (current && articles.some((article) => article.id === current)) return current
            return articles[0]?.id ?? ''
          })
          return
        }

        setPreviewProducts(fallbackPreviewCatalog)
        setPreviewProductsSource('Muestra local')
        setPreviewProductsError(payload.error || payload.message || 'No se pudieron cargar los artículos.')
      } catch (error) {
        if (cancelled) return
        setPreviewProducts(fallbackPreviewCatalog)
        setPreviewProductsSource('Muestra local')
        setPreviewProductsError(error instanceof Error ? error.message : 'No se pudieron cargar los artículos.')
      } finally {
        if (!cancelled) setPreviewProductsLoading(false)
      }
    }

    loadPreviewProducts()
    return () => {
      cancelled = true
    }
  }, [sqlConnectionConnected, sqlConnectionCheckedAt, hasSqlConnectionStatus])

  function notify(kind: ToastKind, message: string) {
    setToast({ kind, message })
  }

  function pushSaveDebug(label: string, detail: unknown) {
    const line = formatSaveDebugLine(label, detail)
    console.error(line, detail)
  }

  async function refreshSqlConnection() {
    setSqlConnectionLoading(true)
    try {
      const response = await fetch('/api/sql/connection')
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        config?: Partial<SqlConnectionConfig>
        connection?: SqlConnectionStatus
        error?: string
      }

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || 'No se pudo leer la conexión SQL.')
      }

      if (payload.config) {
        setSqlConnectionConfig((current) => ({
          server: payload.config?.server ?? current.server,
          database: payload.config?.database ?? current.database,
          user: payload.config?.user ?? current.user,
          password: payload.config?.password && payload.config.password !== '********' ? payload.config.password : current.password,
          port: Number(payload.config?.port ?? current.port) || current.port,
          encrypt: Boolean(payload.config?.encrypt ?? current.encrypt),
          trustServerCertificate:
            payload.config?.trustServerCertificate === undefined
              ? current.trustServerCertificate
              : Boolean(payload.config.trustServerCertificate),
        }))
      }
      setSqlConnectionStatus(payload.connection || null)
      notify('success', payload.connection?.connected ? 'Conexión SQL OK' : 'Configuración cargada')
    } catch (error) {
      setSqlConnectionStatus({
        connected: false,
        message: error instanceof Error ? error.message : 'No se pudo leer la conexión SQL.',
      })
      notify('error', error instanceof Error ? error.message : 'No se pudo leer la conexión SQL.')
    } finally {
      setSqlConnectionLoading(false)
    }
  }

  async function saveSqlConnection() {
    setSqlConnectionSaving(true)
    try {
      const response = await fetch('/api/sql/connection', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          config: sqlConnectionConfig,
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        config?: Partial<SqlConnectionConfig>
        connection?: SqlConnectionStatus
        error?: string
      }

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || 'No se pudo guardar la conexión SQL.')
      }

      if (payload.config) {
        setSqlConnectionConfig((current) => ({
          server: payload.config?.server ?? current.server,
          database: payload.config?.database ?? current.database,
          user: payload.config?.user ?? current.user,
          password: current.password,
          port: Number(payload.config?.port ?? current.port) || current.port,
          encrypt: Boolean(payload.config?.encrypt ?? current.encrypt),
          trustServerCertificate:
            payload.config?.trustServerCertificate === undefined
              ? current.trustServerCertificate
              : Boolean(payload.config.trustServerCertificate),
        }))
      }
      setSqlConnectionStatus(payload.connection || null)
      notify('success', payload.connection?.connected ? 'Conexión guardada y probada' : 'Conexión guardada')
    } catch (error) {
      setSqlConnectionStatus({
        connected: false,
        message: error instanceof Error ? error.message : 'No se pudo guardar la conexión SQL.',
      })
      notify('error', error instanceof Error ? error.message : 'No se pudo guardar la conexión SQL.')
    } finally {
      setSqlConnectionSaving(false)
    }
  }

  function updateDocument(next: LabelDocument) {
    setDocumentState(next)
    setDocumentsByFormat((current) => ({
      ...current,
      [activeFormat]: next,
    }))
  }

  function setCurrentSelectedId(nextId: string) {
    setSelectedId(nextId)
    setSelectedIdsByFormat((current) => ({
      ...current,
      [activeFormat]: nextId,
    }))
  }

  function patchSelectedElement(patch: Partial<EditorElement>) {
    if (!selectedElement) return
    updateDocument(updateElement(documentState, selectedElement.id, patch))
  }

  function applyTemplateQuickAction(nextTemplate: string) {
    if (!selectedElement || !supportsTemplateEditing(selectedElement)) return
    patchSelectedElement({ text: nextTemplate })
  }

  async function handleFormatChange(codigo: FormatCode) {
    const nextFormat = normalizeFormatCode(codigo)
    if (nextFormat === activeFormat) return

    const requestId = formatLoadRequestRef.current + 1
    formatLoadRequestRef.current = requestId

    try {
      const response = await fetch(`/api/sql/report?codigo=${encodeURIComponent(nextFormat)}`)
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        report?: SqlVerificationSnapshot
      }

      if (formatLoadRequestRef.current !== requestId) return

      const loadedDocument =
        response.ok && payload.ok !== false && payload.report ? reportToDocument(payload.report, nextFormat) : createDefaultDocument(nextFormat)

      if (!response.ok && response.status !== 404) {
        throw new Error(payload.error || 'No se pudo leer la plantilla desde SQL.')
      }

      setDocumentsByFormat((current) => ({
        ...current,
        [activeFormat]: documentState,
        [nextFormat]: loadedDocument,
      }))
      setSelectedIdsByFormat((current) => ({
        ...current,
        [activeFormat]: selectedId,
        [nextFormat]: loadedDocument.elementos[0]?.id ?? '',
      }))
      setActiveFormat(nextFormat)
      setDocumentState(loadedDocument)
      setSelectedId(loadedDocument.elementos[0]?.id ?? '')
      paperResizeSourceRef.current = {
        widthMm: loadedDocument.anchoPapelMm,
        heightMm: loadedDocument.altoPapelMm,
      }
      if (!response.ok && response.status !== 404) {
        notify('error', 'No se pudo leer SQL; se cargó una plantilla vacía.')
      }
    } catch (error) {
      if (formatLoadRequestRef.current !== requestId) return

      const fallbackDocument = createDefaultDocument(nextFormat)
      setDocumentsByFormat((current) => ({
        ...current,
        [activeFormat]: documentState,
        [nextFormat]: fallbackDocument,
      }))
      setSelectedIdsByFormat((current) => ({
        ...current,
        [activeFormat]: selectedId,
        [nextFormat]: fallbackDocument.elementos[0]?.id ?? '',
      }))
      setActiveFormat(nextFormat)
      setDocumentState(fallbackDocument)
      setSelectedId(fallbackDocument.elementos[0]?.id ?? '')
      paperResizeSourceRef.current = {
        widthMm: fallbackDocument.anchoPapelMm,
        heightMm: fallbackDocument.altoPapelMm,
      }

      const message = error instanceof Error ? error.message : 'No se pudo leer la plantilla desde SQL.'
      notify('error', message)
    }
  }

  function handleCustomFormatUpdate(nextWidth: number, nextHeight: number) {
    if (
      paperResizeSourceRef.current.widthMm === documentState.anchoPapelMm &&
      paperResizeSourceRef.current.heightMm === documentState.altoPapelMm
    ) {
      paperResizeSourceRef.current = {
        widthMm: documentState.anchoPapelMm,
        heightMm: documentState.altoPapelMm,
      }
    }
    updateDocument(resizeDocumentPaper(documentState, nextWidth, nextHeight))
  }

  function handleRescaleElementsToPaper() {
    const confirmed = window.confirm('Esto reescalará todos los elementos al nuevo tamaño del papel. ¿Continuar?')
    if (!confirmed) return
    const source = paperResizeSourceRef.current
    const next = resizeDocumentPaper(documentState, documentState.anchoPapelMm, documentState.altoPapelMm, {
      scaleElements: true,
      sourceSizeMm: source,
    })
    paperResizeSourceRef.current = {
      widthMm: next.anchoPapelMm,
      heightMm: next.altoPapelMm,
    }
    updateDocument(next)
  }

  function handlePrintMarginUpdate(side: 'left' | 'top' | 'right' | 'bottom', nextMm: number) {
    const nextPx = Math.max(0, Math.round(nextMm * 4))
    const nextMargins = normalizePrintMargins(
      {
        ...(documentState.margenImpresion ?? DEFAULT_PRINT_MARGINS),
        [side]: nextPx,
      },
      canvas,
    )

    updateDocument({
      ...documentState,
      margenImpresion: nextMargins,
    })
  }

  function handleAddElement(tipo: EditorElement['tipo']) {
    const next = addElement(documentState, tipo)
    const inserted = next.elementos.find((element) => !documentState.elementos.some((current) => current.id === element.id))
    updateDocument(next)
    if (inserted) {
      setCurrentSelectedId(inserted.id)
    }
    setOpenAddMenu(null)
  }

  function toggleAddMenu(kind: AddMenuKind) {
    setOpenAddMenu((current) => (current === kind ? null : kind))
  }

  function handleDelete() {
    if (!selectedElement) return
    const nextSelection = documentState.elementos[selectedElementIndex - 1] ?? documentState.elementos[selectedElementIndex + 1] ?? null
    const next = removeElement(documentState, selectedElement.id)
    updateDocument(next)
    setCurrentSelectedId(nextSelection?.id ?? next.elementos[0]?.id ?? '')
  }

  function handleAlign(align: EditorElement['align']) {
    patchSelectedElement({ align })
  }

  function handleToggleVisibility() {
    if (!selectedElement) return
    updateDocument(toggleVisibility(documentState, selectedElement.id))
  }

  function handleDuplicate() {
    if (!selectedElement) return
    const next = duplicateElement(documentState, selectedElement.id)
    const duplicated = next.elementos.find((element) => !documentState.elementos.some((current) => current.id === element.id))
    updateDocument(next)
    setCurrentSelectedId(duplicated?.id ?? selectedElement.id)
  }

  function handleMoveLayerBackward() {
    if (!selectedElement) return
    updateDocument(sendElementBackward(documentState, selectedElement.id))
  }

  function handleMoveLayerForward() {
    if (!selectedElement) return
    updateDocument(bringElementForward(documentState, selectedElement.id))
  }

  function handleMoveLayerToBack() {
    if (!selectedElement) return
    updateDocument(sendElementToBack(documentState, selectedElement.id))
  }

  function handleMoveLayerToFront() {
    if (!selectedElement) return
    updateDocument(bringElementToFront(documentState, selectedElement.id))
  }

  function handleSelectLayer(elementId: string) {
    setCurrentSelectedId(elementId)
    setShowAdvancedInspector(true)
  }

  function handleEditText(element: EditorElement) {
    if (!supportsTemplateEditing(element) && element.tipo !== 'logo') {
      return
    }

    const nextText = window.prompt('Editar texto', element.text || getElementTemplateText(element) || '')
    if (nextText === null) return
    updateDocument(updateElement(documentState, element.id, { text: nextText }))
  }

  function updateZoom(delta: number) {
    if (viewMode === 'editor') {
      setEditorZoom((current) => clamp(Number((current + delta).toFixed(2)), 0.75, 1.35))
      return
    }

    setPreviewZoom((current) => clamp(Number((current + delta).toFixed(2)), 0.75, 1.35))
  }

  function openPreview() {
    if (filteredPreviewProducts.length > 0 && !filteredPreviewProducts.some((product) => product.id === selectedPreviewId)) {
      setSelectedPreviewId(filteredPreviewProducts[0].id)
    }
    setPreviewZoom(1)
    setViewMode('preview')
  }

  function closePreview() {
    setViewMode('editor')
  }

  function compareSqlVerificationSnapshots(expected: SqlVerificationSnapshot, actual: SqlVerificationSnapshot) {
    const mismatches: Array<{ path: string; expected: unknown; actual: unknown }> = []

    function pushMismatch(path: string, expectedValue: unknown, actualValue: unknown) {
      mismatches.push({ path, expected: expectedValue, actual: actualValue })
    }

    if (expected.codigo !== actual.codigo) pushMismatch('codigo', expected.codigo, actual.codigo)
    if (expected.nombre !== actual.nombre) pushMismatch('nombre', expected.nombre, actual.nombre)
    if (expected.anchoPapelMm !== actual.anchoPapelMm) {
      pushMismatch('anchoPapelMm', expected.anchoPapelMm, actual.anchoPapelMm)
    }
    if (expected.altoMm !== actual.altoMm) pushMismatch('altoMm', expected.altoMm, actual.altoMm)
    if (expected.margenImpresion.left !== actual.margenImpresion.left) {
      pushMismatch('margenImpresion.left', expected.margenImpresion.left, actual.margenImpresion.left)
    }
    if (expected.margenImpresion.top !== actual.margenImpresion.top) {
      pushMismatch('margenImpresion.top', expected.margenImpresion.top, actual.margenImpresion.top)
    }
    if (expected.margenImpresion.right !== actual.margenImpresion.right) {
      pushMismatch('margenImpresion.right', expected.margenImpresion.right, actual.margenImpresion.right)
    }
    if (expected.margenImpresion.bottom !== actual.margenImpresion.bottom) {
      pushMismatch('margenImpresion.bottom', expected.margenImpresion.bottom, actual.margenImpresion.bottom)
    }
    if (expected.activo !== actual.activo) pushMismatch('activo', expected.activo, actual.activo)
    if (expected.esPredeterminado !== actual.esPredeterminado) {
      pushMismatch('esPredeterminado', expected.esPredeterminado, actual.esPredeterminado)
    }
    if (expected.detalles.length !== actual.detalles.length) {
      pushMismatch('detalles.length', expected.detalles.length, actual.detalles.length)
    }

    const count = Math.min(expected.detalles.length, actual.detalles.length)
    for (let index = 0; index < count; index += 1) {
      const expectedRow = expected.detalles[index]
      const actualRow = actual.detalles[index]
      const base = `detalles[${index}]`

      ;[
        ['tipoElemento', expectedRow.tipoElemento, actualRow.tipoElemento],
        ['campo', expectedRow.campo, actualRow.campo],
        ['textoFijo', expectedRow.textoFijo, actualRow.textoFijo],
        ['tipoFuente', expectedRow.tipoFuente, actualRow.tipoFuente],
        ['x', expectedRow.x, actualRow.x],
        ['y', expectedRow.y, actualRow.y],
        ['ancho', expectedRow.ancho, actualRow.ancho],
        ['alto', expectedRow.alto, actualRow.alto],
        ['tamanoFuente', expectedRow.tamanoFuente, actualRow.tamanoFuente],
        ['negrita', expectedRow.negrita, actualRow.negrita],
        ['italica', expectedRow.italica, actualRow.italica],
        ['alineacion', expectedRow.alineacion, actualRow.alineacion],
        ['visible', expectedRow.visible, actualRow.visible],
        ['orden', expectedRow.orden, actualRow.orden],
        ['maxLineas', expectedRow.maxLineas, actualRow.maxLineas],
        ['mayuscula', expectedRow.mayuscula, actualRow.mayuscula],
      ].forEach(([field, expectedValue, actualValue]) => {
        if (expectedValue !== actualValue) {
          pushMismatch(`${base}.${String(field)}`, expectedValue, actualValue)
        }
      })
    }

    return {
      ok: mismatches.length === 0,
      mismatches,
    }
  }

  async function saveSql() {
    setSaveStatus('saving')
    setSaveMessage('Guardando...')
    const sqlDocument = normalizeDocumentForSql(documentState)
    try {
      const saveResponse = await fetch('/api/sql/save', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          document: sqlDocument,
        }),
      })

      const savePayload = (await saveResponse.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        reportId?: number
        elementCount?: number
        savedAt?: string
        report?: SqlVerificationSnapshot | null
        verification?: {
          ok?: boolean
          mismatches?: Array<{ path: string; expected: unknown; actual: unknown }>
        }
      }

      pushSaveDebug('save_response', {
        status: saveResponse.status,
        ok: saveResponse.ok,
        payload: savePayload,
      })

      if (!saveResponse.ok || savePayload.ok === false) {
        const error = 'No se pudo guardar la plantilla.'
        pushSaveDebug('save_error', error)
        throw new Error(error)
      }

      setSaveStatus('verifying')
      setSaveMessage('Verificando...')

      const savedReport = savePayload.report
      const savedVerification = savePayload.verification
      if (savedReport) {
        const expected = buildSqlVerificationSnapshot(sqlDocument)
        const verification =
          savedVerification && typeof savedVerification.ok === 'boolean'
            ? {
                ok: savedVerification.ok,
                mismatches: Array.isArray(savedVerification.mismatches) ? savedVerification.mismatches : [],
              }
            : compareSqlVerificationSnapshots(expected, savedReport)
        pushSaveDebug('verify_from_save', {
          ok: verification.ok,
          mismatches: verification.mismatches.slice(0, 10),
        })

        if (!verification.ok) {
          setSaveStatus('verified')
          const detail = getFriendlySaveMismatchMessage(verification.mismatches)
          setSaveMessage('Guardado en SQL. Verificación pendiente.')
          pushSaveDebug('save_mismatch', {
            summary: verification.mismatches
              .slice(0, 3)
              .map((item) => `${item.path}: esperado ${JSON.stringify(item.expected)} / SQL ${JSON.stringify(item.actual)}`)
              .join(' | '),
            mismatches: verification.mismatches,
            expected: expected.detalles.slice(0, 5),
            actual: savedReport.detalles.slice(0, 5),
          })
          notify('success', detail)
          return
        }

        setSaveStatus('verified')
        setSaveMessage('Guardado verificado.')
        notify('success', 'Guardado verificado.')
        return
      }

      let verifyPayload: {
        ok?: boolean
        error?: string
        report?: SqlVerificationSnapshot
      } = {}

      try {
        const verifyResponse = await fetch(`/api/sql/report?codigo=${encodeURIComponent(documentState.codigo)}`)
        verifyPayload = (await verifyResponse.json().catch(() => ({}))) as typeof verifyPayload
        pushSaveDebug('verify_response', {
          status: verifyResponse.status,
          ok: verifyResponse.ok,
          payload: verifyPayload,
        })

        if (!verifyResponse.ok || verifyPayload.ok === false || !verifyPayload.report) {
          const error = 'No se pudo verificar el guardado. Revisar conexión o datos SQL.'
          pushSaveDebug('verify_error', error)
          throw new Error(error)
        }
      } catch (verifyError) {
        setSaveStatus('error')
        setSaveMessage('No se pudo verificar el guardado.')
        const message =
          verifyError instanceof Error ? verifyError.message : 'No se pudo verificar el guardado. Revisar conexión o datos SQL.'
        pushSaveDebug('verify_exception', {
          message,
          error: verifyError,
        })
        notify('error', message)
        return
      }

      const expected = buildSqlVerificationSnapshot(sqlDocument)
      const verification =
        savePayload.verification && typeof savePayload.verification.ok === 'boolean'
          ? {
              ok: savePayload.verification.ok,
              mismatches: Array.isArray(savePayload.verification.mismatches) ? savePayload.verification.mismatches : [],
            }
          : compareSqlVerificationSnapshots(expected, verifyPayload.report)
      pushSaveDebug('verify_from_get', {
        ok: verification.ok,
        mismatches: verification.mismatches.slice(0, 10),
      })

      if (!verification.ok) {
        setSaveStatus('verified')
        const detail = getFriendlySaveMismatchMessage(verification.mismatches)
        setSaveMessage('Guardado en SQL. Verificación pendiente.')
        pushSaveDebug('save_mismatch', {
          summary: verification.mismatches
            .slice(0, 3)
            .map((item) => `${item.path}: esperado ${JSON.stringify(item.expected)} / SQL ${JSON.stringify(item.actual)}`)
            .join(' | '),
          mismatches: verification.mismatches,
          expected: expected.detalles.slice(0, 5),
          actual: verifyPayload.report.detalles.slice(0, 5),
        })
        notify('success', detail)
        return
      }

      setSaveStatus('verified')
      setSaveMessage('Guardado verificado.')
      notify('success', 'Guardado verificado.')
    } catch (error) {
      setSaveStatus('error')
      const message = error instanceof Error ? error.message : 'No se pudo guardar la plantilla.'
      setSaveMessage('No se pudo guardar la plantilla.')
      pushSaveDebug('save_exception', {
        message,
        error,
        documentCode: documentState.codigo,
        documentName: documentState.nombre,
      })
      notify('error', message)
    }
  }


  const toggleTheme = () => {
    setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const setSelectedFontWeight = (nextWeight: 'normal' | 'bold') => {
    if (!selectedElement) return
    patchSelectedElement({ fontWeight: nextWeight })
  }

  const setSelectedItalic = (value: boolean) => {
    if (!selectedElement) return
    patchSelectedElement({
      italica: value,
      fontStyle: value ? 'italic' : 'normal',
    })
  }

  const adjustSelectedFontSize = (delta: number) => {
    if (!selectedElement) return
    const nextSize = clamp(Math.round(selectedElement.fontSize + delta), 8, 80)
    patchSelectedElement({ fontSize: nextSize })
  }

  function renderMarginGuides() {
    if (!selectedElement || !selectedMargins) return null

    return (
      <div className="margin-guides" aria-hidden="true">
        <div
          className="margin-guide is-horizontal is-left"
          style={{
            left: 0,
            top: selectedElement.y + selectedElement.height / 2,
            width: selectedMargins.leftPx,
          }}
        />
        <div
          className="margin-guide is-horizontal is-right"
          style={{
            left: selectedElement.x + selectedElement.width,
            top: selectedElement.y + selectedElement.height / 2,
            width: selectedMargins.rightPx,
          }}
        />
        <div
          className="margin-guide is-vertical is-top"
          style={{
            left: selectedElement.x + selectedElement.width / 2,
            top: 0,
            height: selectedMargins.topPx,
          }}
        />
        <div
          className="margin-guide is-vertical is-bottom"
          style={{
            left: selectedElement.x + selectedElement.width / 2,
            top: selectedElement.y + selectedElement.height,
            height: selectedMargins.bottomPx,
          }}
        />
      </div>
    )
  }

  function renderPrintSafeArea() {
    if (
      printableArea.margins.left === 0 &&
      printableArea.margins.top === 0 &&
      printableArea.margins.right === 0 &&
      printableArea.margins.bottom === 0
    ) {
      return null
    }

    return (
      <div
        className="print-safe-area"
        aria-hidden="true"
        style={{
          left: printableArea.x,
          top: printableArea.y,
          width: printableArea.width,
          height: printableArea.height,
        }}
      />
    )
  }

  function renderElementNode(element: AlfaScanLayoutItem, index: number, interactive: boolean, scale = 1) {
    const hiddenClass = element.visible ? '' : 'is-hidden'
    const isSelected = interactive && element.id === selectedId
    const isBarcodeFont = element.tipoFuente === 'Barcode'
    const barcodeValueStyle = isBarcodeFont
      ? {
          fontFamily: '"Libre Barcode 128", monospace',
          fontWeight: 400,
          fontStyle: 'normal' as const,
          lineHeight: 1,
          letterSpacing: 0,
          whiteSpace: 'nowrap',
          wordBreak: 'normal' as const,
        }
      : {}

    const content = (
      <div
        className={`element-content type-${element.tipo}`}
        style={{
          color: element.color,
          fontSize: element.fontSize * scale,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          textDecoration: element.underline ? 'underline' : 'none',
          fontFamily: element.fontFamily,
          textAlign: element.align,
          lineHeight: element.lineHeight,
        }}
      >
        {element.tipo === 'linea' ? (
          <span className="line-shape" />
        ) : element.tipo === 'logo' ? (
          <div className="logo-box">
            {element.imageUrl ? <img src={element.imageUrl} alt={element.nombre} /> : <span>{element.text || 'LOGO'}</span>}
          </div>
        ) : element.tipo === 'rectangulo' ? (
          <div className="rectangle-box" aria-hidden="true" />
        ) : (
          <span
            className="element-value"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: element.maxLineas,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              ...(element.tipo === 'codigoBarra' ? barcodeValueStyle : {}),
            }}
          >
            {element.displayValue}
          </span>
        )}
      </div>
    )

    if (!interactive) {
      return (
        <div
          key={element.id}
          className={`draggable-element preview-element ${hiddenClass}`}
          style={{
            position: 'absolute',
            left: element.x * scale,
            top: element.y * scale,
            width: element.width * scale,
            height: element.height * scale,
          }}
        >
          {content}
          <span className="selection-tag">{index + 1}</span>
        </div>
      )
    }

    return (
      <Rnd
        key={element.id}
        bounds="parent"
        scale={editorZoom}
        size={{ width: element.width, height: element.height }}
        position={{ x: element.x, y: element.y }}
        enableResizing
        dragGrid={[4, 4]}
        resizeGrid={[4, 4]}
        onDragStop={(_, dataPosition) => {
          updateDocument(updateElement(documentState, element.id, { x: dataPosition.x, y: dataPosition.y }))
        }}
        onResizeStop={(_, __, ref, ___, position) => {
          updateDocument(
            updateElement(documentState, element.id, {
              width: Math.round(ref.offsetWidth),
              height: Math.round(ref.offsetHeight),
              x: position.x,
              y: position.y,
            }),
          )
        }}
        className={`draggable-element ${isSelected ? 'selected' : ''} ${hiddenClass}`}
        onMouseDown={() => setCurrentSelectedId(element.id)}
        onDoubleClick={() => {
          setCurrentSelectedId(element.id)
          handleEditText(element)
        }}
      >
        {content}
        {isSelected ? <span className="selection-tag">{index + 1}</span> : null}
      </Rnd>
    )
  }

  return (
    <div className="app-shell" data-theme={themeMode}>
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <img src={BRAND_MARK_LOGO} alt="Alfa" />
          </div>
          <div className="brand-copy">
            <h1>AlfaEditorScan</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <span className={`pill status-chip ${sqlConnectionStatus?.connected ? 'pill-ok' : 'pill-error'}`}>
            <span className={`status-dot ${sqlConnectionStatus?.connected ? 'is-online' : ''}`} />
            {sqlConnectionStatus?.connected ? 'Base conectada' : sqlConnectionLoading ? 'Base cargando' : 'Base desconectada'}
          </span>
          <button className="ghost" type="button" onClick={() => (viewMode === 'editor' ? openPreview() : closePreview())}>
            {viewMode === 'editor' ? 'Previsualizar' : 'Volver'}
          </button>
          <button className="ghost" type="button" onClick={toggleTheme}>
            {themeLabel}
          </button>
          <button className="primary" type="button" onClick={saveSql} disabled={saveStatus === 'saving' || saveStatus === 'verifying'}>
            {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'verifying' ? 'Verificando...' : 'Guardar'}
          </button>
          <span className={`pill ${saveStatus === 'saving' || saveStatus === 'verifying' ? 'pill-warn' : saveStatus === 'error' || saveStatus === 'mismatch' ? 'pill-error' : ''}`}>
            {saveMessage || toast.message || 'Listo'}
          </span>
        </div>
      </header>

      {viewMode === 'editor' ? (
        <main className="workspace">
          <aside className="panel left-panel">
          <section className={`card sql-card ${showSqlConnectionPanel ? 'is-open' : 'is-closed'}`}>
            <div className="card-head">
              <div>
                <h2>Base de datos</h2>
              </div>
              <div className="card-head-actions">
                <span className={`pill status-chip ${sqlConnectionStatus?.connected ? 'pill-ok' : 'pill-error'}`}>
                  <span className={`status-dot ${sqlConnectionStatus?.connected ? 'is-online' : ''}`} />
                  {sqlConnectionStatus?.connected ? 'Conectado' : sqlConnectionLoading ? 'Cargando...' : 'Desconectado'}
                </span>
                <button
                  className="ghost ghost-small"
                  type="button"
                  onClick={() => setShowSqlConnectionPanel((current) => !current)}
                  aria-expanded={showSqlConnectionPanel}
                >
                  {showSqlConnectionPanel ? <ChevronUp size={16} strokeWidth={2.3} /> : <ChevronDown size={16} strokeWidth={2.3} />}
                  <span>{showSqlConnectionPanel ? 'Ocultar' : 'Configurar'}</span>
                </button>
              </div>
            </div>

            {showSqlConnectionPanel ? (
              <div className="connection-editor">
                <div className="field">
                  <label htmlFor="sql-server">Servidor</label>
                  <input
                    id="sql-server"
                    type="text"
                    value={sqlConnectionConfig.server}
                    onChange={(event) => setSqlConnectionConfig((current) => ({ ...current, server: event.target.value }))}
                    placeholder="localhost\\SQLEXPRESS"
                  />
                </div>

                <div className="field">
                  <label htmlFor="sql-database">Base de datos</label>
                  <input
                    id="sql-database"
                    type="text"
                    value={sqlConnectionConfig.database}
                    onChange={(event) => setSqlConnectionConfig((current) => ({ ...current, database: event.target.value }))}
                    placeholder="NANODISTRI"
                  />
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="sql-user">Usuario</label>
                    <input
                      id="sql-user"
                      type="text"
                      value={sqlConnectionConfig.user}
                      onChange={(event) => setSqlConnectionConfig((current) => ({ ...current, user: event.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="sql-port">Puerto</label>
                    <input
                      id="sql-port"
                      type="number"
                      min={1}
                      max={65535}
                      value={sqlConnectionConfig.port}
                      onChange={(event) =>
                        setSqlConnectionConfig((current) => ({
                          ...current,
                          port: Number(event.target.value) || 1433,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="sql-password">Contraseña</label>
                  <input
                    id="sql-password"
                    type="password"
                    value={sqlConnectionConfig.password}
                    onChange={(event) => setSqlConnectionConfig((current) => ({ ...current, password: event.target.value }))}
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid-2">
                  <label className="field checkbox-field" htmlFor="sql-encrypt">
                    <span>Encrypt</span>
                    <input
                      id="sql-encrypt"
                      type="checkbox"
                      checked={sqlConnectionConfig.encrypt}
                      onChange={(event) =>
                        setSqlConnectionConfig((current) => ({ ...current, encrypt: event.target.checked }))
                      }
                    />
                  </label>
                  <label className="field checkbox-field" htmlFor="sql-trust">
                    <span>Trust cert</span>
                    <input
                      id="sql-trust"
                      type="checkbox"
                      checked={sqlConnectionConfig.trustServerCertificate}
                      onChange={(event) =>
                        setSqlConnectionConfig((current) => ({
                          ...current,
                          trustServerCertificate: event.target.checked,
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="connection-actions">
                  <button className="ghost" type="button" onClick={refreshSqlConnection} disabled={sqlConnectionLoading || sqlConnectionSaving}>
                    Probar
                  </button>
                  <button className="primary" type="button" onClick={saveSqlConnection} disabled={sqlConnectionLoading || sqlConnectionSaving}>
                    {sqlConnectionSaving ? 'Guardando...' : 'Guardar conexión'}
                  </button>
                </div>

                <p className="helper-text">La conexión queda guardada en `sql-connection.json` junto a la aplicación.</p>
              </div>
            ) : null}
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Formato</h2>
              <span className="pill">
                {documentState.anchoPapelMm} mm × {documentState.altoPapelMm} mm
              </span>
            </div>
            <div className="field">
              <label htmlFor="format">Formato</label>
              <select
                id="format"
                value={documentState.codigo}
                onChange={(event) => handleFormatChange(event.target.value as FormatCode)}
              >
                {paperFormats.map((format) => (
                  <option key={format.codigo} value={format.codigo}>
                    {format.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="sheet-name">Nombre de la planilla</label>
              <input
                id="sheet-name"
                type="text"
                maxLength={100}
                value={documentState.nombre}
                onChange={(event) => updateDocument({ ...documentState, nombre: event.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label htmlFor="custom-width">Ancho etiqueta mm</label>
                <input
                  id="custom-width"
                  type="number"
                  min={20}
                  max={120}
                  value={documentState.anchoPapelMm}
                  onChange={(event) => handleCustomFormatUpdate(Number(event.target.value), documentState.altoPapelMm)}
                />
              </div>
              <div className="field">
                <label htmlFor="custom-height">Alto etiqueta mm</label>
                <input
                  id="custom-height"
                  type="number"
                  min={10}
                  max={120}
                  value={documentState.altoPapelMm}
                  onChange={(event) => handleCustomFormatUpdate(documentState.anchoPapelMm, Number(event.target.value))}
                />
              </div>
            </div>
            <div className="format-dimensions-summary">
              <span>Área: {documentState.anchoPapelMm} mm × {documentState.altoPapelMm} mm</span>
              <span>Canvas: {canvas.widthPx} px × {canvas.heightPx} px</span>
            </div>
            <div className="connection-actions format-actions">
              <button className="ghost" type="button" onClick={handleRescaleElementsToPaper}>
                Reescalar elementos al papel
              </button>
            </div>
            <div className="grid-2">
              <label className="field checkbox-field" htmlFor="sheet-active">
                <span>Activo</span>
                <input
                  id="sheet-active"
                  type="checkbox"
                  checked={documentState.activo}
                  onChange={(event) => updateDocument({ ...documentState, activo: event.target.checked })}
                />
              </label>
              <label className="field checkbox-field" htmlFor="sheet-default">
                <span>Predeterminado</span>
                <input
                  id="sheet-default"
                  type="checkbox"
                  checked={documentState.esPredeterminado}
                  onChange={(event) => updateDocument({ ...documentState, esPredeterminado: event.target.checked })}
                />
              </label>
            </div>
            <div className="field">
              <label>Margen de impresión</label>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="print-margin-left">Izq mm</label>
                  <input
                    id="print-margin-left"
                    type="number"
                    min={0}
                    max={Math.floor(documentState.anchoPapelMm / 2)}
                    value={pxToMm(printableArea.margins.left)}
                    onChange={(event) => handlePrintMarginUpdate('left', Number(event.target.value))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="print-margin-top">Sup mm</label>
                  <input
                    id="print-margin-top"
                    type="number"
                    min={0}
                    max={Math.floor(documentState.altoPapelMm / 2)}
                    value={pxToMm(printableArea.margins.top)}
                    onChange={(event) => handlePrintMarginUpdate('top', Number(event.target.value))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="print-margin-right">Der mm</label>
                  <input
                    id="print-margin-right"
                    type="number"
                    min={0}
                    max={Math.floor(documentState.anchoPapelMm / 2)}
                    value={pxToMm(printableArea.margins.right)}
                    onChange={(event) => handlePrintMarginUpdate('right', Number(event.target.value))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="print-margin-bottom">Inf mm</label>
                  <input
                    id="print-margin-bottom"
                    type="number"
                    min={0}
                    max={Math.floor(documentState.altoPapelMm / 2)}
                    value={pxToMm(printableArea.margins.bottom)}
                    onChange={(event) => handlePrintMarginUpdate('bottom', Number(event.target.value))}
                  />
                </div>
              </div>
              <span className="helper-text">
                Área útil: {pxToMm(printableArea.width)} mm × {pxToMm(printableArea.height)} mm.
              </span>
            </div>
            <p className="helper-text">1 mm = 4 px. El canvas usa el mismo modelo visual que la vista previa.</p>
          </section>
          </aside>

          <section className="canvas-column">
            {selectedElement ? (
              <div className="floating-toolbar card">
                <div className="toolbar-row toolbar-row-primary">
                  <div className="toolbar-title-block">
                    <span className="toolbar-label">Elemento</span>
                    <strong>{selectedFieldLabel || selectedElement.nombre}</strong>
                  </div>
                  <label className="toolbar-control toolbar-select toolbar-size-control">
                    <span>Tamaño</span>
                    <div className="size-stepper">
                      <button
                        type="button"
                        className="tool-button icon-button"
                        onClick={() => adjustSelectedFontSize(-1)}
                        title="Disminuir letra"
                        aria-label="Disminuir letra"
                      >
                        A-
                      </button>
                      <select
                        value={selectedElement.fontSize}
                        onChange={(event) => patchSelectedElement({ fontSize: Number(event.target.value) })}
                      >
                        {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="tool-button icon-button"
                        onClick={() => adjustSelectedFontSize(1)}
                        title="Aumentar letra"
                        aria-label="Aumentar letra"
                      >
                        A+
                      </button>
                    </div>
                  </label>
                  <label className="toolbar-control toolbar-select">
                    <span>Tipografía</span>
                    <select
                      value={selectedElement.tipoFuente || inferTipoFuente(selectedElement.fontFamily)}
                      onChange={(event) => {
                        const nextTipoFuente = event.target.value
                        const isBarcodeFont = nextTipoFuente === 'Barcode'
                        patchSelectedElement({
                          tipoFuente: nextTipoFuente,
                          fontFamily: tipoFuenteToFontFamily(nextTipoFuente),
                          fontWeight: isBarcodeFont ? 'normal' : selectedElement.fontWeight,
                          fontStyle: isBarcodeFont ? 'normal' : selectedElement.fontStyle,
                          italica: isBarcodeFont ? false : selectedElement.italica,
                        })
                      }}
                    >
                      {fontSourceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="toolbar-color" title="Color">
                    <span>Color</span>
                    <input
                      type="color"
                      value={selectedElement.color}
                      onChange={(event) => patchSelectedElement({ color: event.target.value })}
                      aria-label="Color del elemento"
                    />
                  </label>
                  <label className="toolbar-control toolbar-select">
                    <span>Líneas</span>
                    <select
                      value={selectedElement.maxLineas}
                      onChange={(event) => patchSelectedElement({ maxLineas: Number(event.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="toolbar-segment" role="group" aria-label="Formato de texto">
                    <button
                      type="button"
                      className={`tool-button icon-button ${selectedElement.fontWeight === 'bold' ? 'is-active' : ''}`}
                      onClick={() => setSelectedFontWeight(selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                      title="Negrita"
                      aria-label="Negrita"
                    >
                      <Bold size={16} strokeWidth={2.3} />
                    </button>
                    <button
                      type="button"
                      className={`tool-button icon-button ${selectedElement.italica ? 'is-active' : ''}`}
                      onClick={() => setSelectedItalic(!selectedElement.italica)}
                      title="Itálica"
                      aria-label="Itálica"
                    >
                      <Italic size={16} strokeWidth={2.3} />
                    </button>
                    <button
                      type="button"
                      className={`tool-button icon-button ${selectedElement.uppercase ? 'is-active' : ''}`}
                      onClick={() => patchSelectedElement({ uppercase: !selectedElement.uppercase })}
                      title="Mayúsculas"
                      aria-label="Mayúsculas"
                    >
                      <Type size={16} strokeWidth={2.3} />
                    </button>
                  </div>
                  <div className="toolbar-segment" role="group" aria-label="Alineación">
                    <button
                      type="button"
                      className={`tool-button icon-button ${selectedElement.align === 'left' ? 'is-active' : ''}`}
                      onClick={() => handleAlign('left')}
                      title="Alinear a la izquierda"
                      aria-label="Alinear a la izquierda"
                    >
                      <AlignLeft size={16} strokeWidth={2.3} />
                    </button>
                    <button
                      type="button"
                      className={`tool-button icon-button ${selectedElement.align === 'center' ? 'is-active' : ''}`}
                      onClick={() => handleAlign('center')}
                      title="Centrar"
                      aria-label="Centrar"
                    >
                      <AlignCenter size={16} strokeWidth={2.3} />
                    </button>
                    <button
                      type="button"
                      className={`tool-button icon-button ${selectedElement.align === 'right' ? 'is-active' : ''}`}
                      onClick={() => handleAlign('right')}
                      title="Alinear a la derecha"
                      aria-label="Alinear a la derecha"
                    >
                      <AlignRight size={16} strokeWidth={2.3} />
                    </button>
                  </div>
                  <div className="toolbar-segment" role="group" aria-label="Orden de capas">
                    <button
                      type="button"
                      className="ghost ghost-small layer-action-button"
                      onClick={handleMoveLayerToBack}
                      disabled={selectedElementIsFirst}
                      title="Enviar al fondo"
                    >
                      Fondo
                    </button>
                    <button
                      type="button"
                      className="ghost ghost-small layer-action-button"
                      onClick={handleMoveLayerBackward}
                      disabled={selectedElementIsFirst}
                      title="Enviar atrás"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      className="ghost ghost-small layer-action-button"
                      onClick={handleMoveLayerForward}
                      disabled={selectedElementIsLast}
                      title="Traer adelante"
                    >
                      Adelante
                    </button>
                    <button
                      type="button"
                      className="ghost ghost-small layer-action-button"
                      onClick={handleMoveLayerToFront}
                      disabled={selectedElementIsLast}
                      title="Traer al frente"
                    >
                      Frente
                    </button>
                  </div>
                  <button
                    type="button"
                    className={`tool-button icon-button ${selectedElement.visible ? 'is-active' : ''}`}
                    onClick={handleToggleVisibility}
                    title={selectedElement.visible ? 'Ocultar' : 'Mostrar'}
                    aria-label={selectedElement.visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {selectedElement.visible ? <Eye size={16} strokeWidth={2.3} /> : <EyeOff size={16} strokeWidth={2.3} />}
                  </button>
                  <button type="button" className="tool-button icon-button" onClick={handleDuplicate} title="Duplicar" aria-label="Duplicar">
                    <Copy size={16} strokeWidth={2.3} />
                  </button>
                  <button type="button" className="tool-button danger-tool icon-button" onClick={handleDelete} title="Eliminar" aria-label="Eliminar">
                    <Trash2 size={16} strokeWidth={2.3} />
                  </button>
                  <button
                    type="button"
                    className="ghost ghost-small toolbar-details-button"
                    onClick={() => setShowAdvancedInspector((current) => !current)}
                  >
                    {showAdvancedInspector ? 'Ocultar panel' : 'Propiedades'}
                  </button>
                  <div className="toolbar-add-actions" ref={addElementMenuRef}>
                    <div className="add-element-popover">
                      <button
                        type="button"
                        className="tool-button add-element-button"
                        onClick={() => toggleAddMenu('data')}
                        aria-expanded={openAddMenu === 'data'}
                        aria-haspopup="menu"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                        <span>+ Dato</span>
                      </button>
                      {openAddMenu === 'data' ? (
                        <div className="add-element-menu add-element-menu-data" role="menu" aria-label="Agregar dato">
                          {DATA_ADD_OPTIONS.map((item) => (
                            <button
                              key={`${item.tipo}-${item.nombre}`}
                              type="button"
                              className="add-element-option"
                              onClick={() => handleAddElement(item.tipo)}
                            >
                              <strong>{item.nombre}</strong>
                              <span>{item.descripcion}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="add-element-popover add-element-popover-right">
                      <button
                        type="button"
                        className="tool-button add-element-button"
                        onClick={() => toggleAddMenu('design')}
                        aria-expanded={openAddMenu === 'design'}
                        aria-haspopup="menu"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                        <span>+ Diseño</span>
                      </button>
                      {openAddMenu === 'design' ? (
                        <div className="add-element-menu add-element-menu-design" role="menu" aria-label="Agregar diseño">
                          {DESIGN_ADD_OPTIONS.map((item) => (
                            <button
                              key={`${item.tipo}-${item.nombre}`}
                              type="button"
                              className="add-element-option"
                              onClick={() => handleAddElement(item.tipo)}
                            >
                              <strong>{item.nombre}</strong>
                              <span>{item.descripcion}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {supportsTemplateEditing(selectedElement) ? (
                  <div className="toolbar-row toolbar-row-secondary">
                    <div className="toolbar-field-strip">
                      <span>Campo</span>
                      <strong>{selectedFieldLabel}</strong>
                    </div>
                    <div className="toolbar-chip-row" role="group" aria-label="Prefijos y sufijos rápidos">
                      {selectedQuickActions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          className="ghost ghost-small quick-template-button"
                          onClick={() => applyTemplateQuickAction(action.value)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className={`canvas-workspace ${showAdvancedInspector ? 'has-inspector' : ''}`}>
              <div className="canvas-stage">
                <div
                  className="paper-zoom-frame"
                  style={{ width: canvas.widthPx * editorZoom, height: canvas.heightPx * editorZoom }}
                >
                  <div
                    className="paper"
                    style={{
                      width: canvas.widthPx,
                      height: canvas.heightPx,
                      transform: `scale(${editorZoom})`,
                    }}
                  >
                    {renderPrintSafeArea()}
                    {renderMarginGuides()}
                    {alfaScanLayout.items.map((item, index) => renderElementNode(item, index, true))}
                  </div>
                </div>

                <div className="zoom-controls">
                  <button type="button" className="ghost zoom-button" onClick={() => updateZoom(-0.1)}>
                    - Zoom -
                  </button>
                  <span className="zoom-label">{zoomLabel}</span>
                  <button type="button" className="ghost zoom-button" onClick={() => updateZoom(0.1)}>
                    + Zoom +
                  </button>
                </div>
              </div>

              {showAdvancedInspector ? (
                <aside className="advanced-inspector card">
                  <div className="card-head">
                    <div>
                      <h2>Propiedades y capas</h2>
                      {selectedElement ? <span className="inspector-subtitle">{selectedElement.nombre}</span> : null}
                    </div>
                    <button type="button" className="ghost ghost-small" onClick={() => setShowAdvancedInspector(false)}>
                      Ocultar
                    </button>
                  </div>

                  {selectedElement ? (
                    <>
                      <div className="inspector-layer-actions">
                        <button
                          type="button"
                          className="ghost ghost-small"
                          onClick={handleMoveLayerToBack}
                          disabled={selectedElementIsFirst}
                        >
                          Enviar al fondo
                        </button>
                        <button
                          type="button"
                          className="ghost ghost-small"
                          onClick={handleMoveLayerBackward}
                          disabled={selectedElementIsFirst}
                        >
                          Enviar atrás
                        </button>
                        <button
                          type="button"
                          className="ghost ghost-small"
                          onClick={handleMoveLayerForward}
                          disabled={selectedElementIsLast}
                        >
                          Traer adelante
                        </button>
                        <button
                          type="button"
                          className="ghost ghost-small"
                          onClick={handleMoveLayerToFront}
                          disabled={selectedElementIsLast}
                        >
                          Traer al frente
                        </button>
                      </div>

                      <div className="grid-2 inspector-grid">
                        <div className="field">
                          <label htmlFor="inspector-x">X</label>
                          <input
                            id="inspector-x"
                            type="number"
                            value={selectedElement.x}
                            onChange={(event) => patchSelectedElement({ x: Number(event.target.value) })}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="inspector-y">Y</label>
                          <input
                            id="inspector-y"
                            type="number"
                            value={selectedElement.y}
                            onChange={(event) => patchSelectedElement({ y: Number(event.target.value) })}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="inspector-width">Ancho</label>
                          <input
                            id="inspector-width"
                            type="number"
                            value={selectedElement.width}
                            onChange={(event) => patchSelectedElement({ width: Number(event.target.value) })}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="inspector-height">Alto</label>
                          <input
                            id="inspector-height"
                            type="number"
                            value={selectedElement.height}
                            onChange={(event) => patchSelectedElement({ height: Number(event.target.value) })}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="inspector-order">Orden</label>
                          <input id="inspector-order" type="number" value={selectedElementOrder} readOnly />
                        </div>
                        <div className="field">
                          <label htmlFor="inspector-layer">Capa</label>
                          <input id="inspector-layer" type="text" value={getElementLayerLabel(selectedElement)} readOnly />
                        </div>
                        <div className="field">
                          <label htmlFor="inspector-lines">MaxLineas</label>
                          <input
                            id="inspector-lines"
                            type="number"
                            min={1}
                            max={10}
                            value={selectedElement.maxLineas ?? 1}
                            onChange={(event) => patchSelectedElement({ maxLineas: Number(event.target.value) })}
                          />
                        </div>
                        {selectedElement.tipo === 'logo' ? (
                          <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label htmlFor="inspector-logo">Logo</label>
                            <select
                              id="inspector-logo"
                              value={selectedElement.imageUrl || ''}
                              onChange={(event) =>
                                patchSelectedElement({
                                  imageUrl: event.target.value,
                                  text: event.target.value ? '' : 'LOGO',
                                })
                              }
                            >
                              <option value="">Texto LOGO</option>
                              {logoLibrary.map((logo) => (
                                <option key={logo.id} value={logo.src}>
                                  {logo.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null}
                      </div>

                      <section className="layers-panel">
                        <div className="card-head compact">
                          <h3>Capas</h3>
                          <span className="pill">{documentState.elementos.length}</span>
                        </div>
                        <div className="layers-list" role="list" aria-label="Lista de capas">
                          {documentState.elementos.map((element, index) => {
                            const isLayerSelected = element.id === selectedElement.id
                            return (
                              <button
                                key={element.id}
                                type="button"
                                className={`layer-item ${isLayerSelected ? 'is-selected' : ''}`}
                                onClick={() => handleSelectLayer(element.id)}
                              >
                                <span className="layer-order">{index + 1}</span>
                                <span className="layer-main">
                                  <strong>{element.nombre}</strong>
                                  <span>{getElementLayerLabel(element)}</span>
                                </span>
                                <span className="layer-meta">{element.visible ? 'Visible' : 'Oculto'}</span>
                              </button>
                            )
                          })}
                        </div>
                      </section>
                    </>
                  ) : (
                    <p className="helper-text">Selecciona un elemento para ver sus propiedades avanzadas y su posición de capa.</p>
                  )}
                </aside>
              ) : null}
            </div>
          </section>
        </main>
      ) : (
        <main className="preview-workspace">
          <section className="preview-shell card">
            <div className="preview-sidebar">
              <div className="card-head">
                <h2>Buscar producto</h2>
                <span className="pill">{filteredPreviewProducts.length}</span>
              </div>
              <div className="preview-source-row">
                <span className="pill preview-source-pill">{previewProductsSource}</span>
                {previewProductsLoading ? <span className="preview-note">Cargando artículos...</span> : null}
                {previewProductsError ? <span className="preview-note is-error">{previewProductsError}</span> : null}
              </div>
              <section className="preview-manual card-soft">
                <div className="card-head compact">
                  <h3>Campos manuales</h3>
                  <span className="pill">Opcional</span>
                </div>
                <div className="preview-manual-grid">
                  <label className="field">
                    <span>Empresa</span>
                    <input
                      type="text"
                      value={previewManualFields.companyName}
                      onChange={(event) => setPreviewManualFields((current) => ({ ...current, companyName: event.target.value }))}
                      placeholder="Escribir otro valor"
                    />
                  </label>
                  <label className="field">
                    <span>Descripción</span>
                    <input
                      type="text"
                      value={previewManualFields.description}
                      onChange={(event) => setPreviewManualFields((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Escribir otro valor"
                    />
                  </label>
                  <label className="field">
                    <span>Precio</span>
                    <input
                      type="text"
                      value={previewManualFields.price}
                      onChange={(event) => setPreviewManualFields((current) => ({ ...current, price: event.target.value }))}
                      placeholder="Escribir otro valor"
                    />
                  </label>
                  <label className="field">
                    <span>Código artículo</span>
                    <input
                      type="text"
                      value={previewManualFields.internalCode}
                      onChange={(event) => setPreviewManualFields((current) => ({ ...current, internalCode: event.target.value }))}
                      placeholder="Escribir otro valor"
                    />
                  </label>
                  <label className="field">
                    <span>Código barra</span>
                    <input
                      type="text"
                      value={previewManualFields.barcode}
                      onChange={(event) => setPreviewManualFields((current) => ({ ...current, barcode: event.target.value }))}
                      placeholder="Escribir otro valor"
                    />
                  </label>
                  <label className="field">
                    <span>Stock</span>
                    <input
                      type="text"
                      value={previewManualFields.stock}
                      onChange={(event) => setPreviewManualFields((current) => ({ ...current, stock: event.target.value }))}
                      placeholder="Escribir otro valor"
                    />
                  </label>
                </div>
              </section>
              <div className="field">
                <label htmlFor="preview-search">Código, barra o descripción</label>
                <input
                  id="preview-search"
                  type="search"
                  placeholder="Buscar producto..."
                  value={previewQuery}
                  onChange={(event) => setPreviewQuery(event.target.value)}
                />
              </div>
              <div className="preview-result-list">
                {filteredPreviewProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className={`preview-result ${product.id === selectedPreviewProduct.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedPreviewId(product.id)}
                  >
                    <strong>{product.description}</strong>
                    <span>{getPreviewTitle(product)}</span>
                    <small>
                      {product.internalCode} · {product.barcode}
                    </small>
                  </button>
                ))}
              </div>
            </div>

              <div className="preview-stage">
              <div className="preview-header">
                <div>
                  <span className="pill preview-badge">Previsualización</span>
                  <h2>{getPreviewTitle(selectedPreviewProduct)}</h2>
                  <span className="preview-source-inline">{previewProductsSource}</span>
                </div>
                <div className="preview-meta">
                  <span className="pill">{selectedPreviewProduct.internalCode}</span>
                  <span className="pill">{selectedPreviewProduct.stock} en stock</span>
                </div>
              </div>
              <div className="preview-board">
                <div
                  className="paper-zoom-frame"
                  style={{ width: canvas.widthPx * previewZoom, height: canvas.heightPx * previewZoom }}
                >
                  <div
                    className="paper preview-paper"
                    style={{
                      width: canvas.widthPx,
                      height: canvas.heightPx,
                      transform: `scale(${previewZoom})`,
                    }}
                  >
                    {renderPrintSafeArea()}
                    {alfaScanLayout.items.map((item, index) => renderElementNode(item, index, false))}
                  </div>
                </div>
                <div className="zoom-controls">
                  <button type="button" className="ghost zoom-button" onClick={() => updateZoom(-0.1)}>
                    - Zoom -
                  </button>
                  <span className="zoom-label">{zoomLabel}</span>
                  <button type="button" className="ghost zoom-button" onClick={() => updateZoom(0.1)}>
                    + Zoom +
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default App


































