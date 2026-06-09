import { useEffect, useMemo, useState } from 'react'
import { Rnd } from 'react-rnd'
import './App.css'
import {
  addElement,
  buildFileName,
  buildSqlScript,
  changeFontSize,
  centerElement,
  createDefaultDocument,
  duplicateElement,
  elementPalette,
  getCanvasSize,
  getElementById,
  getElementDisplayValue,
  getElementName,
  getPaperFormat,
  parseDocumentJson,
  paperFormats,
  removeElement,
  sampleData,
  scaleDocumentToFormat,
  serializeDocument,
  STORAGE_KEY,
  toggleVisibility,
  updateElement,
  type EditorElement,
  type FormatCode,
  type LabelDocument,
} from './editor'

type ToastKind = 'idle' | 'success' | 'error'

interface PersistedState {
  document: LabelDocument
  selectedId: string
}

function readStoredState(): PersistedState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed?.document?.elementos) return null
    return parsed
  } catch {
    return null
  }
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function App() {
  const stored = useMemo(() => readStoredState(), [])

  const [documentState, setDocumentState] = useState<LabelDocument>(
    stored?.document ?? createDefaultDocument('gondola'),
  )
  const [selectedId, setSelectedId] = useState<string>(
    stored?.selectedId ?? stored?.document.elementos[0]?.id ?? documentState.elementos[0]?.id ?? '',
  )
  const [importText, setImportText] = useState('')
  const [toast, setToast] = useState<{ kind: ToastKind; message: string }>({
    kind: 'idle',
    message: '',
  })
  const [customWidthMm, setCustomWidthMm] = useState(documentState.anchoPapelMm)
  const [customHeightMm, setCustomHeightMm] = useState(documentState.altoPapelMm)

  const canvas = getCanvasSize(documentState)
  const effectiveSelectedId = documentState.elementos.some((element) => element.id === selectedId)
    ? selectedId
    : documentState.elementos[0]?.id ?? ''
  const selectedElement = getElementById(documentState, effectiveSelectedId)
  const exportedJson = serializeDocument(documentState)
  const sqlScript = buildSqlScript(documentState)

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
    if (codigo === documentState.codigo) return

    const nextFormat = getPaperFormat(codigo)

    if (codigo === 'personalizado') {
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
    const format = getPaperFormat('personalizado')

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

  function handleDuplicate() {
    if (!selectedElement) return
    const next = duplicateElement(documentState, selectedElement.id)
    const duplicatedId = next.elementos[next.elementos.findIndex((element) => element.id === selectedElement.id) + 1]?.id
    updateDocument(next)
    setSelectedId(duplicatedId ?? selectedElement.id)
  }

  function handleDelete() {
    if (!selectedElement) return
    const next = removeElement(documentState, selectedElement.id)
    updateDocument(next)
    setSelectedId(next.elementos[0]?.id ?? '')
  }

  function handleCenter() {
    if (!selectedElement) return
    updateDocument(centerElement(documentState, selectedElement.id))
  }

  function handleAlign(align: EditorElement['align']) {
    patchSelectedElement({ align })
  }

  async function copyJson() {
    await navigator.clipboard.writeText(exportedJson)
    notify('success', 'JSON copiado al portapapeles.')
  }

  async function copySql() {
    await navigator.clipboard.writeText(sqlScript)
    notify('success', 'SQL copiado al portapapeles.')
  }

  function downloadJson() {
    downloadTextFile(buildFileName(documentState, 'json'), exportedJson, 'application/json;charset=utf-8')
    notify('success', 'JSON descargado.')
  }

  function downloadSql() {
    downloadTextFile(buildFileName(documentState, 'sql'), sqlScript, 'text/sql;charset=utf-8')
    notify('success', 'SQL descargado.')
  }

  function importJsonFromText() {
    try {
      const next = parseDocumentJson(importText, getPaperFormat('gondola'))
      updateDocument(next)
      setCustomWidthMm(next.anchoPapelMm)
      setCustomHeightMm(next.altoPapelMm)
      setSelectedId(next.elementos[0]?.id ?? '')
      notify('success', 'JSON importado correctamente.')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'No se pudo importar el JSON.')
    }
  }

  function handleFileImport(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : ''
        const next = parseDocumentJson(text, getPaperFormat('gondola'))
        updateDocument(next)
        setCustomWidthMm(next.anchoPapelMm)
        setCustomHeightMm(next.altoPapelMm)
        setSelectedId(next.elementos[0]?.id ?? '')
        notify('success', 'JSON cargado desde archivo.')
      } catch (error) {
        notify('error', error instanceof Error ? error.message : 'No se pudo leer el archivo.')
      }
    }
    reader.readAsText(file)
  }

  function saveToBrowser() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        document: documentState,
        selectedId,
      }),
    )
    notify('success', 'Borrador guardado localmente.')
  }

  const customFormatActive = documentState.codigo === 'personalizado'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">AE</div>
          <div>
            <p className="eyebrow">AlfaEditorScan</p>
            <h1>Editor de etiquetas local</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost" type="button" onClick={saveToBrowser}>
            Guardar borrador
          </button>
          <button className="primary" type="button" onClick={downloadJson}>
            Descargar JSON
          </button>
          <button className="ghost" type="button" onClick={downloadSql}>
            Descargar SQL
          </button>
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

          <section className="card">
            <div className="card-head">
              <h2>Importar</h2>
              <span className={`pill ${toast.kind === 'error' ? 'pill-error' : ''}`}>
                {toast.message || 'Local'}
              </span>
            </div>
            <textarea
              rows={10}
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder="Pegá acá el JSON exportado."
            />
            <div className="row">
              <label className="file-button">
                Cargar archivo JSON
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => handleFileImport(event.target.files?.[0] ?? null)}
                />
              </label>
              <button className="ghost" type="button" onClick={importJsonFromText}>
                Importar texto
              </button>
            </div>
            <p className="helper-text">
              El JSON queda listo para reimportarlo en AlfaScan o para versionarlo en disco.
            </p>
          </section>
        </aside>

        <section className="canvas-column">
          <div className="canvas-toolbar card">
            <div>
              <p className="eyebrow">Vista previa</p>
              <h2>{documentState.nombre}</h2>
            </div>
            <div className="toolbar-group">
              <button className="ghost" type="button" onClick={copyJson}>
                Copiar JSON
              </button>
              <button className="ghost" type="button" onClick={copySql}>
                Copiar SQL
              </button>
              <button className="ghost" type="button" onClick={() => handleAddElement('textoFijo')}>
                + Texto
              </button>
            </div>
          </div>

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
                    dragGrid={[1, 1]}
                    resizeGrid={[1, 1]}
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

        <aside className="panel right-panel">
          <section className="card">
            <div className="card-head">
              <h2>Propiedades</h2>
              <span className="pill">{selectedElement ? selectedElement.nombre : 'Sin selección'}</span>
            </div>
            {selectedElement ? (
              <>
                <div className="field">
                  <label htmlFor="element-name">Nombre</label>
                  <input
                    id="element-name"
                    type="text"
                    value={selectedElement.nombre}
                    onChange={(event) => patchSelectedElement({ nombre: event.target.value })}
                  />
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="element-x">X</label>
                    <input
                      id="element-x"
                      type="number"
                      value={selectedElement.x}
                      onChange={(event) => patchSelectedElement({ x: Number(event.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="element-y">Y</label>
                    <input
                      id="element-y"
                      type="number"
                      value={selectedElement.y}
                      onChange={(event) => patchSelectedElement({ y: Number(event.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="element-width">Ancho</label>
                    <input
                      id="element-width"
                      type="number"
                      value={selectedElement.width}
                      onChange={(event) => patchSelectedElement({ width: Number(event.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="element-height">Alto</label>
                    <input
                      id="element-height"
                      type="number"
                      value={selectedElement.height}
                      onChange={(event) => patchSelectedElement({ height: Number(event.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="element-font">Letra</label>
                    <input
                      id="element-font"
                      type="number"
                      min={8}
                      max={64}
                      value={selectedElement.fontSize}
                      onChange={(event) => patchSelectedElement({ fontSize: Number(event.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="element-color">Color</label>
                    <input
                      id="element-color"
                      type="color"
                      value={selectedElement.color}
                      onChange={(event) => patchSelectedElement({ color: event.target.value })}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="element-text">Texto fijo / logo</label>
                  <input
                    id="element-text"
                    type="text"
                    value={selectedElement.text}
                    onChange={(event) => patchSelectedElement({ text: event.target.value })}
                    disabled={selectedElement.tipo === 'linea'}
                  />
                </div>
                <div className="field">
                  <label htmlFor="element-image">Logo URL</label>
                  <input
                    id="element-image"
                    type="text"
                    value={selectedElement.imageUrl}
                    onChange={(event) => patchSelectedElement({ imageUrl: event.target.value })}
                    disabled={selectedElement.tipo !== 'logo'}
                    placeholder="Opcional"
                  />
                </div>
                <div className="toolbar-grid">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => updateDocument(changeFontSize(documentState, selectedElement.id, 2))}
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => updateDocument(changeFontSize(documentState, selectedElement.id, -2))}
                  >
                    A-
                  </button>
                  <button type="button" className="ghost" onClick={() => handleAlign('left')}>
                    Izq.
                  </button>
                  <button type="button" className="ghost" onClick={() => handleAlign('center')}>
                    Centro
                  </button>
                  <button type="button" className="ghost" onClick={() => handleAlign('right')}>
                    Der.
                  </button>
                  <button type="button" className="ghost" onClick={handleCenter}>
                    Centrar
                  </button>
                  <button type="button" className="ghost" onClick={handleDuplicate}>
                    Duplicar
                  </button>
                  <button type="button" className="ghost" onClick={() => updateDocument(toggleVisibility(documentState, selectedElement.id))}>
                    {selectedElement.visible ? 'Ocultar' : 'Mostrar'}
                  </button>
                  <button type="button" className="danger" onClick={handleDelete}>
                    Eliminar
                  </button>
                </div>
              </>
            ) : (
              <p className="helper-text">
                Seleccioná un elemento en el canvas para editar posición, tamaño y estilo.
              </p>
            )}
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Compatibilidad</h2>
              <span className="pill">AlfaScan</span>
            </div>
            <div className="compat-grid">
              <div>
                <strong>JSON</strong>
                <p>Exporta la estructura que después puede leer AlfaScan.</p>
              </div>
              <div>
                <strong>SQL Server</strong>
                <p>Genera script para <code>dbo.Scan_Reporte</code> y <code>dbo.Scan_ReporteDetalle</code>.</p>
              </div>
              <div>
                <strong>Sin servidor</strong>
                <p>Todo funciona localmente en el navegador, sin API ni login.</p>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Resumen</h2>
              <span className="pill">{sqlScript.length.toLocaleString('es-AR')} chars</span>
            </div>
            <pre className="code-block">{sqlScript}</pre>
          </section>
        </aside>
      </main>
    </div>
  )
}

export default App
