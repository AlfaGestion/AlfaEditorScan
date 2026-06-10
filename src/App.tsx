import { useEffect, useMemo, useState } from 'react'
import { Rnd } from 'react-rnd'
import './App.css'
import heroLogo from './assets/hero.png'
import {
  addElement,
  createDefaultDocument,
  duplicateElement,
  elementPalette,
  getCanvasSize,
  getElementById,
  getElementDisplayValue,
  getElementName,
  getPaperFormat,
  paperFormats,
  removeElement,
  sampleData,
  scaleDocumentToFormat,
  STORAGE_KEY,
  toggleVisibility,
  updateElement,
  type EditorElement,
  type FormatCode,
  type LabelDocument,
} from './editor'

type ToastKind = 'idle' | 'success' | 'error'

type ThemeMode = 'light' | 'dark'
type ViewMode = 'editor' | 'preview'

interface PersistedState {
  document: LabelDocument
  selectedId: string
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

const THEME_STORAGE_KEY = 'alfa-editor-scan:theme'

const previewCatalog: PreviewProduct[] = [
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

function toPreviewSample(product: PreviewProduct): typeof sampleData {
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

function normalizeStoredDocument(document: LabelDocument): LabelDocument {
  return {
    ...document,
    codigo: normalizeFormatCode(document.codigo),
    elementos: (document.elementos || []).map((element) => ({
      ...element,
      fontStyle: element.fontStyle === 'italic' ? 'italic' : 'normal',
      italica: element.italica === true || element.fontStyle === 'italic',
      underline: Boolean(element.underline),
      fontFamily: element.fontFamily || 'Aptos, Segoe UI, Arial, sans-serif',
      uppercase: Boolean(element.uppercase),
      maxLineas: Number(element.maxLineas ?? 1),
    })),
  }
}

function readStoredState(): PersistedState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed?.document?.elementos) return null
    return {
      ...parsed,
      document: normalizeStoredDocument(parsed.document),
    }
  } catch {
    return null
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function App() {
  const stored = useMemo(() => readStoredState(), [])
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readStoredTheme())

  const [documentState, setDocumentState] = useState<LabelDocument>(
    stored?.document ?? createDefaultDocument('gondola'),
  )
  const [selectedId, setSelectedId] = useState<string>(
    stored?.selectedId ?? stored?.document.elementos[0]?.id ?? documentState.elementos[0]?.id ?? '',
  )
  const [toast, setToast] = useState<{ kind: ToastKind; message: string }>({
    kind: 'idle',
    message: '',
  })
  const [customWidthMm, setCustomWidthMm] = useState(documentState.anchoPapelMm)
  const [customHeightMm, setCustomHeightMm] = useState(documentState.altoPapelMm)
  const [editorZoom, setEditorZoom] = useState(1)
  const [previewZoom, setPreviewZoom] = useState(1)
  const [isSavingSql, setIsSavingSql] = useState(false)
  const [showAdvancedInspector, setShowAdvancedInspector] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('editor')
  const [previewQuery, setPreviewQuery] = useState('')
  const [selectedPreviewId, setSelectedPreviewId] = useState(previewCatalog[0]?.id ?? '')

  const canvas = getCanvasSize(documentState)
  const effectiveSelectedId = documentState.elementos.some((element) => element.id === selectedId)
    ? selectedId
    : documentState.elementos[0]?.id ?? ''
  const selectedElement = getElementById(documentState, effectiveSelectedId)
  const filteredPreviewProducts = useMemo(() => {
    const query = previewQuery.trim().toLowerCase()
    if (!query) return previewCatalog
    return previewCatalog.filter((product) => {
      return [product.id, product.companyName, product.description, product.internalCode, product.barcode]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [previewQuery])
  const selectedPreviewProduct =
    filteredPreviewProducts.find((product) => product.id === selectedPreviewId) ?? filteredPreviewProducts[0] ?? previewCatalog[0]
  const previewData = toPreviewSample(selectedPreviewProduct)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        document: documentState,
        selectedId,
      }),
    )
  }, [documentState, selectedId])

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

  function notify(kind: ToastKind, message: string) {
    setToast({ kind, message })
  }

  function updateDocument(next: LabelDocument) {
    setDocumentState(next)
  }

  function patchSelectedElement(patch: Partial<EditorElement>) {
    if (!selectedElement) return
    updateDocument(updateElement(documentState, selectedElement.id, patch))
  }

  function handleFormatChange(codigo: FormatCode) {
    if (normalizeFormatCode(codigo) === normalizeFormatCode(documentState.codigo)) return

    const nextFormat = getPaperFormat(codigo)

    if (codigo === 'custom') {
      const nextDocument = {
        ...documentState,
        codigo: nextFormat.codigo,
        nombre: nextFormat.nombre,
        anchoPapelMm: customWidthMm,
        altoPapelMm: customHeightMm,
      }
      updateDocument(nextDocument)
      return
    }

    updateDocument(scaleDocumentToFormat(documentState, nextFormat))
  }

  function handleCustomFormatUpdate(nextWidth: number, nextHeight: number) {
    const safeWidth = clamp(Math.round(nextWidth), 30, 200)
    const safeHeight = clamp(Math.round(nextHeight), 20, 240)
    const format = getPaperFormat('custom')

    setCustomWidthMm(safeWidth)
    setCustomHeightMm(safeHeight)
    updateDocument({
      ...documentState,
      codigo: format.codigo,
      nombre: format.nombre,
      anchoPapelMm: safeWidth,
      altoPapelMm: safeHeight,
    })
  }

  function handleAddElement(tipo: EditorElement['tipo']) {
    const next = addElement(documentState, tipo)
    updateDocument(next)
    setSelectedId(next.elementos[next.elementos.length - 1]?.id ?? '')
  }

  function handleDelete() {
    if (!selectedElement) return
    const next = removeElement(documentState, selectedElement.id)
    updateDocument(next)
    setSelectedId(next.elementos[0]?.id ?? '')
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
    const duplicatedId = next.elementos[next.elementos.findIndex((element) => element.id === selectedElement.id) + 1]?.id
    updateDocument(next)
    setSelectedId(duplicatedId ?? selectedElement.id)
  }

  function handleEditText(element: EditorElement) {
    if (!['textoFijo', 'empresa', 'descripcion', 'precio', 'codigoArticulo', 'codigoBarra', 'stock', 'fecha', 'logo'].includes(element.tipo)) {
      return
    }

    const nextText = window.prompt('Editar texto', element.text || '')
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

  async function saveSql() {
    setIsSavingSql(true)
    try {
      const response = await fetch('/api/sql/save', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          document: documentState,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        reportId?: number
        elementCount?: number
        savedAt?: string
      }

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || 'No se pudo guardar en SQL Server.')
      }

      notify('success', 'Diseño guardado en SQL Server.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar en SQL Server.'
      notify('error', message)
    } finally {
      setIsSavingSql(false)
    }
  }

  const customFormatActive = normalizeFormatCode(documentState.codigo) === 'custom'
  const themeLabel = themeMode === 'dark' ? 'Modo oscuro' : 'Modo claro'
  const currentZoom = viewMode === 'editor' ? editorZoom : previewZoom
  const zoomLabel = `${Math.round(currentZoom * 100)}%`

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

  function renderElementNode(
    element: EditorElement,
    index: number,
    data: typeof sampleData,
    interactive: boolean,
    scale = 1,
  ) {
    const hiddenClass = element.visible ? '' : 'is-hidden'
    const isSelected = interactive && element.id === selectedId

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
        ) : (
          <>
            <span className="element-label">{getElementName(element.tipo)}</span>
            <span className="element-value">{getElementDisplayValue(element, data)}</span>
          </>
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
        enableResizing={element.tipo !== 'linea'}
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
        onMouseDown={() => setSelectedId(element.id)}
        onDoubleClick={() => {
          setSelectedId(element.id)
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
            <img src={heroLogo} alt="AlfaScan" />
          </div>
          <div>
            <p className="eyebrow">AlfaEditorScan</p>
            <h1>Editor de etiquetas local</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost" type="button" onClick={() => (viewMode === 'editor' ? openPreview() : closePreview())}>
            {viewMode === 'editor' ? 'Previsualizar' : 'Volver al editor'}
          </button>
          <button className="ghost" type="button" onClick={() => setShowAdvancedInspector((current) => !current)}>
            {showAdvancedInspector ? 'Cerrar opciones' : 'Más opciones'}
          </button>
          <button className="ghost" type="button" onClick={toggleTheme}>
            {themeLabel}
          </button>
          <button className="primary" type="button" onClick={saveSql} disabled={isSavingSql}>
            {isSavingSql ? 'Guardando...' : 'Guardar'}
          </button>
          <span className={`pill ${isSavingSql ? 'pill-warn' : toast.kind === 'error' ? 'pill-error' : ''}`}>
            {isSavingSql ? 'Guardando...' : toast.message || 'Listo'}
          </span>
        </div>
      </header>

      {viewMode === 'editor' ? (
        <main className="workspace">
          <aside className="panel left-panel">
          <section className="card">
            <div className="card-head">
              <h2>Formato</h2>
              <span className="pill">
                {documentState.anchoPapelMm} mm · {canvas.widthPx} px
              </span>
            </div>
            <div className="field">
              <label htmlFor="format">Plantilla</label>
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

            <div className="grid-2">
              <div className="field">
                <label htmlFor="custom-width">Ancho mm</label>
                <input
                  id="custom-width"
                  type="number"
                  min={30}
                  max={200}
                  value={customWidthMm}
                  onChange={(event) => handleCustomFormatUpdate(Number(event.target.value), customHeightMm)}
                  disabled={!customFormatActive}
                />
              </div>
              <div className="field">
                <label htmlFor="custom-height">Alto mm</label>
                <input
                  id="custom-height"
                  type="number"
                  min={20}
                  max={240}
                  value={customHeightMm}
                  onChange={(event) => handleCustomFormatUpdate(customWidthMm, Number(event.target.value))}
                  disabled={!customFormatActive}
                />
              </div>
            </div>
            <p className="helper-text">
              1 mm = 4 px. La vista previa usa el mismo mapeo que AlfaScan.
            </p>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Elementos</h2>
              <span className="pill">{documentState.elementos.length}</span>
            </div>
            <div className="palette">
              {elementPalette.map((item) => (
                <button
                  key={item.tipo}
                  className="palette-item"
                  type="button"
                  onClick={() => handleAddElement(item.tipo)}
                >
                  <strong>{item.nombre}</strong>
                  <span>{item.descripcion}</span>
                </button>
              ))}
            </div>
          </section>
          </aside>

          <section className="canvas-column">
          {selectedElement ? (
            <div className="floating-toolbar card">
              <label className="toolbar-control toolbar-select">
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
              <label className="toolbar-color" title="Color">
                <span>Color</span>
                <input
                  type="color"
                  value={selectedElement.color}
                  onChange={(event) => patchSelectedElement({ color: event.target.value })}
                  aria-label="Color del elemento"
                />
              </label>
              <div className="toolbar-segment" role="group" aria-label="Formato de texto">
                <button
                  type="button"
                  className={`tool-button icon-button ${selectedElement.fontWeight === 'bold' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFontWeight(selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                  title="Negrita"
                  aria-label="Negrita"
                >
                  B
                </button>
                <button
                  type="button"
                  className={`tool-button icon-button ${selectedElement.italica ? 'is-active' : ''}`}
                  onClick={() => setSelectedItalic(!selectedElement.italica)}
                  title="Itálica"
                  aria-label="Itálica"
                >
                  I
                </button>
                <button
                  type="button"
                  className={`tool-button icon-button ${selectedElement.uppercase ? 'is-active' : ''}`}
                  onClick={() => patchSelectedElement({ uppercase: !selectedElement.uppercase })}
                  title="Mayúsculas"
                  aria-label="Mayúsculas"
                >
                  AA
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
                  ⟸
                </button>
                <button
                  type="button"
                  className={`tool-button icon-button ${selectedElement.align === 'center' ? 'is-active' : ''}`}
                  onClick={() => handleAlign('center')}
                  title="Centrar"
                  aria-label="Centrar"
                >
                  ≡
                </button>
                <button
                  type="button"
                  className={`tool-button icon-button ${selectedElement.align === 'right' ? 'is-active' : ''}`}
                  onClick={() => handleAlign('right')}
                  title="Alinear a la derecha"
                  aria-label="Alinear a la derecha"
                >
                  ⟹
                </button>
              </div>
              <button
                type="button"
                className={`tool-button icon-button ${selectedElement.visible ? 'is-active' : ''}`}
                onClick={handleToggleVisibility}
                title={selectedElement.visible ? 'Ocultar' : 'Mostrar'}
                aria-label={selectedElement.visible ? 'Ocultar' : 'Mostrar'}
              >
                {selectedElement.visible ? '👁' : '🚫'}
              </button>
              <button
                type="button"
                className="tool-button icon-button"
                onClick={handleDuplicate}
                title="Duplicar"
                aria-label="Duplicar"
              >
                ⧉
              </button>
              <button
                type="button"
                className="tool-button danger-tool icon-button"
                onClick={handleDelete}
                title="Eliminar"
                aria-label="Eliminar"
              >
                🗑
              </button>
            </div>
          ) : null}

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
                      {documentState.elementos.map((element, index) => renderElementNode(element, index, sampleData, true))}
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
                <h2>Propiedades avanzadas</h2>
                <button type="button" className="ghost ghost-small" onClick={() => setShowAdvancedInspector(false)}>
                  Cerrar
                </button>
              </div>
              {selectedElement ? (
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
                    <input
                      id="inspector-order"
                      type="number"
                      value={documentState.elementos.findIndex((element) => element.id === selectedElement.id) + 1}
                      readOnly
                    />
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
                </div>
              ) : (
                <p className="helper-text">Selecciona un elemento para ver sus propiedades avanzadas.</p>
              )}
            </aside>
          ) : null}
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
                    <span>{product.companyName}</span>
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
                  <h2>{selectedPreviewProduct.companyName}</h2>
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
                    {documentState.elementos.map((element, index) =>
                      renderElementNode(element, index, previewData, false, 1),
                    )}
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



