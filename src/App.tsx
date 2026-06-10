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

interface PersistedState {
  document: LabelDocument
  selectedId: string
}

const THEME_STORAGE_KEY = 'alfa-editor-scan:theme'

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
  const [isSavingSql, setIsSavingSql] = useState(false)

  const canvas = getCanvasSize(documentState)
  const effectiveSelectedId = documentState.elementos.some((element) => element.id === selectedId)
    ? selectedId
    : documentState.elementos[0]?.id ?? ''
  const selectedElement = getElementById(documentState, effectiveSelectedId)

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
              <div className="floating-toolbar-left">
                <strong>{selectedElement.nombre}</strong>
                <span>{getElementName(selectedElement.tipo)}</span>
              </div>
              <div className="floating-toolbar-group">
                <label className="mini-control">
                  <span>Tamaño</span>
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
                </label>
                <button type="button" className={`tool-button tool-button-inline ${selectedElement.fontWeight === 'bold' ? 'is-active' : ''}`} onClick={() => setSelectedFontWeight(selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}>
                  <span className="tool-icon">B</span>
                  <span>Negrita</span>
                </button>
                <button type="button" className={`tool-button tool-button-inline ${selectedElement.italica ? 'is-active' : ''}`} onClick={() => setSelectedItalic(!selectedElement.italica)}>
                  <span className="tool-icon">I</span>
                  <span>Itálica</span>
                </button>
                <button type="button" className={`tool-button tool-button-inline ${selectedElement.uppercase ? 'is-active' : ''}`} onClick={() => patchSelectedElement({ uppercase: !selectedElement.uppercase })}>
                  <span className="tool-icon">AA</span>
                  <span>Mayús.</span>
                </button>
                <button type="button" className="tool-button tool-button-inline" onClick={() => handleAlign('left')}>
                  <span className="tool-icon">⟸</span>
                  <span>Izq.</span>
                </button>
                <button type="button" className="tool-button tool-button-inline" onClick={() => handleAlign('center')}>
                  <span className="tool-icon">≡</span>
                  <span>Centro</span>
                </button>
                <button type="button" className="tool-button tool-button-inline" onClick={() => handleAlign('right')}>
                  <span className="tool-icon">⟹</span>
                  <span>Der.</span>
                </button>
                <button type="button" className="tool-button tool-button-inline" onClick={handleToggleVisibility}>
                  <span className="tool-icon">{selectedElement.visible ? '👁' : '🚫'}</span>
                  <span>{selectedElement.visible ? 'Visible' : 'Oculto'}</span>
                </button>
                <button type="button" className="tool-button tool-button-inline" onClick={() => {
                  const next = duplicateElement(documentState, selectedElement.id)
                  const duplicatedId = next.elementos[next.elementos.findIndex((element) => element.id === selectedElement.id) + 1]?.id
                  updateDocument(next)
                  setSelectedId(duplicatedId ?? selectedElement.id)
                }}>
                  <span className="tool-icon">⧉</span>
                  <span>Duplicar</span>
                </button>
                <button type="button" className="tool-button danger-tool tool-button-inline" onClick={handleDelete}>
                  <span className="tool-icon">🗑</span>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ) : null}

          <div className="canvas-stage">
            <div
              className="paper"
              style={{
                width: canvas.widthPx,
                height: canvas.heightPx,
              }}
            >
              {documentState.elementos.map((element, index) => {
                const isSelected = element.id === selectedId
                const hiddenClass = element.visible ? '' : 'is-hidden'

                return (
                  <Rnd
                    key={element.id}
                    bounds="parent"
                    size={{ width: element.width, height: element.height }}
                    position={{ x: element.x, y: element.y }}
                    enableResizing={element.tipo !== 'linea'}
                    dragGrid={[4, 4]}
                    resizeGrid={[4, 4]}
                    onDragStop={(_, data) => {
                      updateDocument(updateElement(documentState, element.id, { x: data.x, y: data.y }))
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
                  >
                    <div
                      className={`element-content type-${element.tipo}`}
                      style={{
                        color: element.color,
                        fontSize: element.fontSize,
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
                          {element.imageUrl ? (
                            <img src={element.imageUrl} alt={element.nombre} />
                          ) : (
                            <span>{element.text || 'LOGO'}</span>
                          )}
                        </div>
                      ) : (
                        <>
                          <span className="element-label">{getElementName(element.tipo)}</span>
                          <span className="element-value">{getElementDisplayValue(element, sampleData)}</span>
                        </>
                      )}
                    </div>
                    {isSelected ? <span className="selection-tag">{index + 1}</span> : null}
                  </Rnd>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App



