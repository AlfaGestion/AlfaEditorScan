import http from 'node:http'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import sql from 'mssql'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production'
const envFiles = isProduction ? ['.env.production', '.env'] : ['.env.local', '.env']

for (const envFile of envFiles) {
  dotenv.config({ path: path.resolve(__dirname, '..', envFile) })
}
dotenv.config()

const PORT = Number(process.env.SQL_API_PORT || 3001)
const DIST_DIR = path.resolve(__dirname, '..', 'dist')
const SQL_CONFIG_FILE = path.resolve(__dirname, '..', 'sql-connection.json')
const LOG_DIR = path.resolve(__dirname, '..', 'logs')
const LOG_FILE = path.join(LOG_DIR, 'sql-api.log')
const INDEX_FILE = path.join(DIST_DIR, 'index.html')
const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
])

function log(message, detail) {
  const timestamp = new Date().toISOString()
  const serializedDetail =
    detail === undefined
      ? ''
      : ` ${
          typeof detail === 'string'
            ? detail
            : (() => {
                try {
                  return JSON.stringify(detail)
                } catch {
                  return String(detail)
                }
              })()
        }`
  const line = `[${timestamp}] ${message}${serializedDetail}`
  try {
    fsSync.mkdirSync(LOG_DIR, { recursive: true })
    fsSync.appendFileSync(LOG_FILE, `${line}\n`, 'utf8')
  } catch (error) {
    console.error(`[${timestamp}] No se pudo escribir el log`, error instanceof Error ? error.message : error)
  }
  if (detail !== undefined) {
    console.log(`[${timestamp}] ${message}`, detail)
  } else {
    console.log(`[${timestamp}] ${message}`)
  }
}

function toBoolean(value, fallback = false) {
  if (value === true || value === false) return value
  if (value == null || value === '') return fallback
  const normalized = String(value).trim().toLowerCase()
  if (['1', 'true', 'yes', 'on', 'si', 'sí'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return fallback
}

function normalizeSqlConnectionConfig(config = {}) {
  return {
    server: String(config.server ?? process.env.SQL_SERVER ?? '').trim(),
    database: String(config.database ?? process.env.SQL_DATABASE ?? '').trim(),
    user: String(config.user ?? process.env.SQL_USER ?? '').trim(),
    password: String(config.password ?? process.env.SQL_PASSWORD ?? ''),
    port: Number.isFinite(Number(config.port)) ? Number(config.port) : Number(process.env.SQL_PORT || 1433),
    encrypt: toBoolean(config.encrypt ?? process.env.SQL_ENCRYPT, String(process.env.SQL_ENCRYPT || 'false').toLowerCase() === 'true'),
    trustServerCertificate: toBoolean(
      config.trustServerCertificate ?? process.env.SQL_TRUST_SERVER_CERTIFICATE,
      String(process.env.SQL_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true',
    ),
  }
}

function readSqlConnectionConfigFromDisk() {
  try {
    if (!fsSync.existsSync(SQL_CONFIG_FILE)) return null
    const raw = fsSync.readFileSync(SQL_CONFIG_FILE, 'utf8')
    if (!raw.trim()) return null
    return normalizeSqlConnectionConfig(JSON.parse(raw))
  } catch (error) {
    log('SQL config read failed', error instanceof Error ? error.message : error)
    return null
  }
}

function saveSqlConnectionConfigToDisk(config) {
  fsSync.mkdirSync(path.dirname(SQL_CONFIG_FILE), { recursive: true })
  fsSync.writeFileSync(SQL_CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
}

const sqlConnectionConfig = readSqlConnectionConfigFromDisk() || normalizeSqlConnectionConfig()

function getSqlConnectionConfig() {
  return { ...sqlConnectionConfig }
}

function getPublicSqlConnectionConfig() {
  return { ...sqlConnectionConfig }
}

function updateSqlConnectionConfig(nextConfig) {
  const normalized = normalizeSqlConnectionConfig(nextConfig)
  sqlConnectionConfig.server = normalized.server
  sqlConnectionConfig.database = normalized.database
  sqlConnectionConfig.user = normalized.user
  sqlConnectionConfig.password = normalized.password
  sqlConnectionConfig.port = normalized.port
  sqlConnectionConfig.encrypt = normalized.encrypt
  sqlConnectionConfig.trustServerCertificate = normalized.trustServerCertificate
  saveSqlConnectionConfigToDisk(sqlConnectionConfig)
  return getPublicSqlConnectionConfig()
}

function buildSqlConnectionOptions(config = sqlConnectionConfig) {
  return {
    server: config.server,
    database: config.database,
    user: config.user,
    password: config.password,
    port: config.port,
    options: {
      encrypt: config.encrypt,
      trustServerCertificate: config.trustServerCertificate,
    },
  }
}

function isSqlConnectionConfigured(config = sqlConnectionConfig) {
  return Boolean(config.server && config.database && config.user && config.password)
}

function normalizeSqlToken(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function quoteSqlIdentifier(value) {
  return `[${String(value ?? '').replace(/]/g, ']]')}]`
}

const PRODUCT_COLUMN_GROUPS = [
  { key: 'companyName', aliases: ['empresa', 'razonsocial', 'marca', 'proveedor', 'compania', 'companiaNombre'] },
  {
    key: 'description',
    aliases: ['descripcion', 'descripcionproducto', 'descripcionlarga', 'nombre', 'detalle', 'articulo', 'producto'],
  },
  {
    key: 'price',
    aliases: ['precio', 'precioventa', 'preciofinal', 'importe', 'pvp', 'valor'],
  },
  {
    key: 'internalCode',
    aliases: ['codigoarticulo', 'codarticulo', 'codigointerno', 'sku', 'codigo', 'referencia', 'articulo'],
  },
  {
    key: 'barcode',
    aliases: ['codigobarra', 'codbarra', 'barcode', 'ean', 'upc'],
  },
  {
    key: 'stock',
    aliases: ['stock', 'existencia', 'existencias', 'cantidad', 'disponible', 'saldo'],
  },
]

const PRODUCT_TABLE_HINTS = ['articulo', 'articulos', 'producto', 'productos', 'catalogo', 'inventario', 'stock']

function normalizeSqlColumns(rows) {
  const tables = new Map()
  for (const row of rows || []) {
    const schemaName = String(row.TABLE_SCHEMA || '').trim()
    const tableName = String(row.TABLE_NAME || '').trim()
    const columnName = String(row.COLUMN_NAME || '').trim()
    if (!schemaName || !tableName || !columnName) continue

    const tableKey = `${schemaName}.${tableName}`
    if (!tables.has(tableKey)) {
      tables.set(tableKey, {
        schemaName,
        tableName,
        normalizedTableName: normalizeSqlToken(tableName),
        columns: [],
      })
    }

    tables.get(tableKey).columns.push({
      columnName,
      normalizedColumnName: normalizeSqlToken(columnName),
    })
  }
  return [...tables.values()]
}

function pickColumn(table, aliases) {
  return table.columns.find((column) => aliases.includes(column.normalizedColumnName))?.columnName ?? null
}

function scoreProductTable(table) {
  let score = 0
  for (const group of PRODUCT_COLUMN_GROUPS) {
    if (pickColumn(table, group.aliases)) score += 10
  }

  for (const hint of PRODUCT_TABLE_HINTS) {
    if (table.normalizedTableName.includes(hint)) score += 2
  }

  score += Math.min(table.columns.length, 10) * 0.15
  return score
}

function buildProductArticlesQuery(source, limit = 100) {
  const selectedColumns = []
  for (const group of PRODUCT_COLUMN_GROUPS) {
    const columnName = pickColumn(source, group.aliases)
    if (columnName) {
      const sqlColumn = quoteSqlIdentifier(columnName)
      const castLength = group.key === 'price' ? 60 : 250
      selectedColumns.push(
        `COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(${castLength}), ${sqlColumn}))), ''), '') AS ${quoteSqlIdentifier(group.key)}`,
      )
    } else {
      selectedColumns.push(`CAST(N'' AS NVARCHAR(250)) AS ${quoteSqlIdentifier(group.key)}`)
    }
  }

  const orderByColumn =
    pickColumn(source, PRODUCT_COLUMN_GROUPS[3].aliases) ||
    pickColumn(source, PRODUCT_COLUMN_GROUPS[1].aliases) ||
    pickColumn(source, PRODUCT_COLUMN_GROUPS[4].aliases) ||
    null

  const orderByClause = orderByColumn ? `${quoteSqlIdentifier(orderByColumn)}` : '(SELECT NULL)'
  const tablePath = `${quoteSqlIdentifier(source.schemaName)}.${quoteSqlIdentifier(source.tableName)}`
  const safeLimit = Math.max(1, Math.min(500, Math.round(Number(limit) || 100)))

  return `
SELECT TOP (${safeLimit})
  CAST(ROW_NUMBER() OVER (ORDER BY ${orderByClause}) AS NVARCHAR(50)) AS [id],
  ${selectedColumns.join(',\n  ')}
FROM ${tablePath}
ORDER BY ${orderByClause};
`
}

async function loadSqlPreviewArticles(config = sqlConnectionConfig, limit = 100) {
  if (!isSqlConnectionConfigured(config)) {
    return {
      articles: [],
      source: null,
      checkedAt: new Date().toISOString(),
      message: 'Faltan datos de conexión.',
    }
  }

  const pool = createSqlPool(config)
  try {
    await pool.connect()
    const safeLimit = Math.max(1, Math.min(500, Math.round(Number(limit) || 100)))
    let queryResult
    let source = {
      schemaName: 'dbo',
      tableName: 'VT_MA_Articulos',
    }

    try {
      queryResult = await pool.request().query(`
        SELECT TOP (${safeLimit})
          CAST(ID AS NVARCHAR(50)) AS id,
          COALESCE(
            NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(250), DescProveedor))), ''),
            NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(250), DescMarca))), ''),
            NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(250), DescFamilia))), ''),
            ''
          ) AS companyName,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(250), DESCRIPCION))), ''), '') AS description,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(60), PRECIO1))), ''), '') AS price,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(50), IDARTICULO))), ''), '') AS internalCode,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(80), CODIGOBARRA))), ''), '') AS barcode,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(30), StockOferta))), ''), '') AS stock
        FROM dbo.VT_MA_Articulos
        ORDER BY DESCRIPCION, ID;
      `)
    } catch (error) {
      const isViewIssue =
        error instanceof Error &&
        /(binding errors|Invalid object name|could not be used to find the bound column)/i.test(error.message)

      if (!isViewIssue) throw error

      source = {
        schemaName: 'dbo',
        tableName: 'V_MA_ARTICULOS',
      }

      queryResult = await pool.request().query(`
        SELECT TOP (${safeLimit})
          CAST(ID AS NVARCHAR(50)) AS id,
          CAST(N'' AS NVARCHAR(250)) AS companyName,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(250), DESCRIPCION))), ''), '') AS description,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(60), PRECIO1))), ''), '') AS price,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(50), IDARTICULO))), ''), '') AS internalCode,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(80), CODIGOBARRA))), ''), '') AS barcode,
          COALESCE(NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(30), StockOferta))), ''), '') AS stock
        FROM dbo.V_MA_ARTICULOS
        ORDER BY DESCRIPCION, ID;
      `)
    }

    const articles = (queryResult.recordset || []).map((row, index) => ({
      id: String(row.id || index + 1),
      companyName: String(row.companyName || '').trim(),
      description: String(row.description || '').trim(),
      price: String(row.price || '').trim(),
      internalCode: String(row.internalCode || '').trim(),
      barcode: String(row.barcode || '').trim(),
      stock: String(row.stock || '').trim(),
    }))

    return {
      articles,
      source,
      checkedAt: new Date().toISOString(),
    }
  } catch (error) {
    const isMissingView = error instanceof Error && /VT_MA_Articulos|Invalid object name/i.test(error.message)
    return {
      articles: [],
      source: null,
      checkedAt: new Date().toISOString(),
      message: isMissingView
      ? 'No existe la vista dbo.VT_MA_Articulos en esta base.'
        : error instanceof Error
          ? error.message
          : 'No se pudieron leer los artículos.',
    }
  } finally {
    await pool.close().catch(() => {})
  }
}

process.on('uncaughtException', (error) => {
  log('Uncaught exception', error instanceof Error ? { message: error.message, stack: error.stack } : error)
})

process.on('unhandledRejection', (reason) => {
  log('Unhandled rejection', reason instanceof Error ? { message: reason.message, stack: reason.stack } : reason)
})
function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  })
  res.end(JSON.stringify(payload))
}

function text(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'text/plain; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  })
  res.end(payload)
}

function getContentType(filePath) {
  return MIME_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream'
}

function resolveStaticPath(requestPath) {
  const normalizedRequestPath = requestPath === '/' ? '/index.html' : requestPath
  const candidatePath = path.normalize(path.join(DIST_DIR, normalizedRequestPath))
  if (!candidatePath.startsWith(DIST_DIR)) return null
  return candidatePath
}

async function serveProductionApp(req, res, pathname) {
  const filePath = resolveStaticPath(pathname)
  if (!filePath) {
    text(res, 400, 'Ruta invÃ¡lida.')
    return
  }

  try {
    const stat = await fs.stat(filePath).catch(() => null)
    const finalPath = stat?.isDirectory() ? path.join(filePath, 'index.html') : filePath
    const finalStat = await fs.stat(finalPath).catch(() => null)

    if (!finalStat?.isFile()) {
      const fallback = await fs.readFile(INDEX_FILE)
      res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'access-control-allow-origin': '*',
      })
      res.end(fallback)
      return
    }

    const payload = await fs.readFile(finalPath)
    res.writeHead(200, {
      'content-type': getContentType(finalPath),
      'cache-control': finalPath.endsWith('index.html') ? 'no-store' : 'public, max-age=31536000, immutable',
      'access-control-allow-origin': '*',
    })
    res.end(payload)
  } catch (error) {
    log('Static asset failed', error instanceof Error ? error.message : error)
    if (pathname === '/' || !path.extname(pathname)) {
      try {
        const fallback = await fs.readFile(INDEX_FILE)
        res.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'access-control-allow-origin': '*',
        })
        res.end(fallback)
        return
      } catch (fallbackError) {
        log('Fallback index failed', fallbackError instanceof Error ? fallbackError.message : fallbackError)
      }
    }

    text(res, 404, 'Archivo no encontrado.')
  }
}

function errorPayload(error) {
  return {
    message: error instanceof Error ? error.message : 'Error desconocido.',
    stack: error instanceof Error ? error.stack : undefined,
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function createSqlPool(config = sqlConnectionConfig) {
  return new sql.ConnectionPool(buildSqlConnectionOptions(config))
}

async function testSqlConnection(config = sqlConnectionConfig) {
  if (!isSqlConnectionConfigured(config)) {
    return {
      connected: false,
      message: 'Faltan datos de conexión.',
      checkedAt: new Date().toISOString(),
    }
  }

  const pool = createSqlPool(config)
  try {
    await pool.connect()
    const result = await pool.request().query('SELECT DB_NAME() AS databaseName, @@SERVERNAME AS serverName;')
    const row = result.recordset?.[0] || {}
    return {
      connected: true,
      message: 'Conectado correctamente.',
      databaseName: typeof row.databaseName === 'string' ? row.databaseName : config.database,
      serverName: typeof row.serverName === 'string' ? row.serverName : config.server,
      checkedAt: new Date().toISOString(),
    }
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : 'No se pudo conectar.',
      checkedAt: new Date().toISOString(),
    }
  } finally {
    await pool.close().catch(() => {})
  }
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeFormatCode(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'producto') return 'product'
  if (normalized === 'chico') return 'small'
  if (normalized === 'personalizado') return 'custom'
  if (normalized === 'gondola' || normalized === 'product' || normalized === 'small' || normalized === 'custom') {
    return normalized
  }
  return 'gondola'
}

function normalizeReportCode(value) {
  const normalized = String(value ?? '').trim()
  return normalized || 'gondola'
}

function normalizeTipoFuente(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized || normalized === 'default') return 'Default'
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

function isElementType(value) {
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
    value === 'logo'
  )
}

function isBarcodeGraphicElement(element) {
  if (element?.tipo !== 'codigoBarra') return false
  return normalizeTipoFuente(element?.tipoFuente ?? element?.fontFamily) === 'Barcode'
}

function mapTypeToSql(element) {
  const tipo = element?.tipo
  if (tipo === 'empresa') return 'Dato'
  if (tipo === 'descripcion') return 'texto'
  if (tipo === 'precio') return 'precio'
  if (tipo === 'codigoBarra') return isBarcodeGraphicElement(element) ? 'codigobarra' : 'texto'
  if (tipo === 'codigoBarraTexto') return 'texto'
  if (tipo === 'linea') return 'linea'
  if (tipo === 'textoFijo') return 'texto'
  return 'texto'
}

function mapFieldToSql(tipo) {
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
    case 'textoFijo':
      return 'TextoFijo'
    case 'linea':
      return 'TextoFijo'
    case 'logo':
      return 'Logo'
    default:
      return null
  }
}

function getFixedText(element) {
  if (element.tipo === 'textoFijo') return element.text && element.text.trim() ? element.text : null
  if (element.tipo === 'linea') return '------------'
  if (element.tipo === 'logo') return element.text || 'Logo'
  return null
}

function getSqlMaxLines(element) {
  const fallback = element.tipo === 'descripcion' ? 3 : element.tipo === 'textoFijo' ? 2 : 1
  return Math.max(1, Math.round(Number(element.maxLineas ?? fallback) || fallback))
}

async function hasColumn(pool, tableName, columnName) {
  const result = await pool.request().query(`
      SELECT CASE WHEN COL_LENGTH('${tableName}', '${columnName}') IS NULL THEN 0 ELSE 1 END AS HasColumn;
    `)
  return Boolean(result.recordset?.[0]?.HasColumn)
}

function normalizeDocument(document) {
  if (!document || typeof document !== 'object') {
    throw new Error('Documento invÃ¡lido.')
  }

  const elementos = Array.isArray(document.elementos) ? document.elementos : []
  if (elementos.length === 0) {
    throw new Error('El documento no tiene elementos.')
  }

  return {
    codigo: normalizeReportCode(document.codigo),
    nombre: typeof document.nombre === 'string' ? document.nombre : 'Gondola',
    anchoPapelMm: toNumber(document.anchoPapelMm, 80),
    altoPapelMm: toNumber(document.altoPapelMm, 60),
    activo: document.activo !== false,
    esPredeterminado: document.esPredeterminado === true,
    elementos: elementos.map((item, index) => {
      const tipo = isElementType(item?.tipo) ? item.tipo : 'textoFijo'
      return {
        id: typeof item?.id === 'string' ? item.id : `imported_${index}`,
        tipo,
        nombre: typeof item?.nombre === 'string' ? item.nombre : tipo,
        x: toNumber(item?.x, 0),
        y: toNumber(item?.y, 0),
        width: toNumber(item?.width, 100),
        height: toNumber(item?.height, 24),
        fontSize: toNumber(item?.fontSize, 14),
        fontWeight: item?.fontWeight === 'normal' ? 'normal' : 'bold',
        fontStyle: item?.fontStyle === 'italic' ? 'italic' : 'normal',
        italica: item?.italica === true || item?.fontStyle === 'italic',
        tipoFuente: normalizeTipoFuente(item?.tipoFuente ?? item?.TipoFuente ?? item?.fontFamily),
        align: item?.align === 'center' || item?.align === 'right' ? item.align : 'left',
        visible: item?.visible !== false,
        color: typeof item?.color === 'string' ? item.color : '#111827',
        text: typeof item?.text === 'string' ? item.text : '',
        imageUrl: typeof item?.imageUrl === 'string' ? item.imageUrl : '',
        lineHeight: toNumber(item?.lineHeight, 1.15),
        uppercase: item?.uppercase === true,
        maxLineas: toNumber(item?.maxLineas, tipo === 'descripcion' ? 3 : tipo === 'textoFijo' ? 2 : 1),
      }
    }),
  }
}

function getDetalleAlineacion(element) {
  return element.align || 'left'
}

function buildVerificationSnapshotFromDocument(document) {
  return {
    codigo: normalizeReportCode(document.codigo),
    nombre: typeof document.nombre === 'string' ? document.nombre : 'Gondola',
    anchoPapelMm: toNumber(document.anchoPapelMm, 80),
    altoMm: toNumber(document.altoPapelMm, 60),
    detalles: document.elementos.map((element, index) => ({
      tipoElemento: mapTypeToSql(element.tipo),
      campo: mapFieldToSql(element.tipo),
      textoFijo: getFixedText(element),
      tipoFuente: normalizeTipoFuente(element.tipoFuente ?? element.fontFamily),
      x: Math.round(element.x),
      y: Math.round(element.y),
      ancho: Math.round(element.width),
      alto: Math.round(element.height),
      tamanoFuente: Math.round(element.fontSize),
      negrita: element.fontWeight === 'bold',
      italica: element.italica === true,
      alineacion: getDetalleAlineacion(element),
      visible: element.visible !== false,
      orden: index + 1,
      maxLineas: getSqlMaxLines(element),
      mayuscula: element.uppercase === true,
    })),
  }
}

function compareVerificationSnapshots(expected, actual) {
  const mismatches = []

  const compareField = (path, expectedValue, actualValue) => {
    if (expectedValue !== actualValue) {
      mismatches.push({ path, expected: expectedValue, actual: actualValue })
    }
  }

  compareField('codigo', expected.codigo, actual.codigo)
  compareField('nombre', expected.nombre, actual.nombre)
  compareField('anchoPapelMm', expected.anchoPapelMm, actual.anchoPapelMm)
  compareField('altoMm', expected.altoMm, actual.altoMm)
  compareField('activo', expected.activo, actual.activo)
  compareField('esPredeterminado', expected.esPredeterminado, actual.esPredeterminado)
  compareField('detalles.length', expected.detalles.length, actual.detalles.length)

  const count = Math.min(expected.detalles.length, actual.detalles.length)
  for (let index = 0; index < count; index += 1) {
    const base = `detalles[${index}]`
    const expectedRow = expected.detalles[index]
    const actualRow = actual.detalles[index]

    compareField(`${base}.tipoElemento`, expectedRow.tipoElemento, actualRow.tipoElemento)
    compareField(`${base}.campo`, expectedRow.campo, actualRow.campo)
    compareField(`${base}.textoFijo`, expectedRow.textoFijo, actualRow.textoFijo)
    compareField(`${base}.tipoFuente`, expectedRow.tipoFuente, actualRow.tipoFuente)
    compareField(`${base}.x`, expectedRow.x, actualRow.x)
    compareField(`${base}.y`, expectedRow.y, actualRow.y)
    compareField(`${base}.ancho`, expectedRow.ancho, actualRow.ancho)
    compareField(`${base}.alto`, expectedRow.alto, actualRow.alto)
    compareField(`${base}.tamanoFuente`, expectedRow.tamanoFuente, actualRow.tamanoFuente)
    compareField(`${base}.negrita`, expectedRow.negrita, actualRow.negrita)
    compareField(`${base}.italica`, expectedRow.italica, actualRow.italica)
    compareField(`${base}.alineacion`, expectedRow.alineacion, actualRow.alineacion)
    compareField(`${base}.visible`, expectedRow.visible, actualRow.visible)
    compareField(`${base}.orden`, expectedRow.orden, actualRow.orden)
    compareField(`${base}.maxLineas`, expectedRow.maxLineas, actualRow.maxLineas)
    compareField(`${base}.mayuscula`, expectedRow.mayuscula, actualRow.mayuscula)
  }

  return {
    ok: mismatches.length === 0,
    mismatches,
  }
}

function rowToVerificationDetail(row, index) {
  return {
    tipoElemento: String(row.TipoElemento ?? '').trim(),
    campo: row.Campo == null || String(row.Campo).trim() === '' ? null : String(row.Campo).trim(),
    textoFijo: row.TextoFijo == null || String(row.TextoFijo).length === 0 ? null : String(row.TextoFijo),
    tipoFuente: normalizeTipoFuente(row.TipoFuente),
    x: toNumber(row.X, 0),
    y: toNumber(row.Y, 0),
    ancho: toNumber(row.Ancho, 0),
    alto: toNumber(row.Alto, 0),
    tamanoFuente: toNumber(row.TamanoFuente, 0),
    negrita: Boolean(row.Negrita),
    italica: Boolean(row.Italica),
    alineacion: typeof row.Alineacion === 'string' && row.Alineacion.trim() ? row.Alineacion : 'left',
    visible: Boolean(row.Visible),
    orden: toNumber(row.Orden, index + 1),
    maxLineas: toNumber(row.MaxLineas, 1),
    mayuscula: Boolean(row.Mayuscula),
  }
}

async function loadReportSnapshotByCodigo(codigo) {
  if (!isSqlConnectionConfigured()) {
    throw new Error('Faltan datos de conexion SQL. Revisar sql-connection.json o .env.')
  }

  const normalizedCodigo = normalizeReportCode(codigo)
  const pool = createSqlPool()

  try {
    await pool.connect()
    const reportResult = await pool
      .request()
      .input('Codigo', sql.NVarChar(50), normalizedCodigo)
      .query(`
        SELECT TOP 1
          IdReporte,
          Codigo,
          Nombre,
          Activo,
          EsPredeterminado,
          AnchoPapelMm,
          AltoMm
        FROM dbo.Scan_Reporte
        WHERE Codigo = @Codigo;
      `)

    const report = reportResult.recordset?.[0]
    if (!report) {
      return null
    }

    const detailResult = await pool
      .request()
      .input('IdReporte', sql.Int, report.IdReporte)
      .query(`
        SELECT
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
          Mayuscula
        FROM dbo.Scan_ReporteDetalle
        WHERE IdReporte = @IdReporte
        ORDER BY Orden ASC, IdDetalle ASC;
      `)

    const details = Array.isArray(detailResult.recordset)
      ? detailResult.recordset.map((row, index) => rowToVerificationDetail(row, index))
      : []

    return {
      codigo: normalizeReportCode(report.Codigo),
      nombre: typeof report.Nombre === 'string' ? report.Nombre : 'Gondola',
      activo: Boolean(report.Activo),
      esPredeterminado: Boolean(report.EsPredeterminado),
      anchoPapelMm: toNumber(report.AnchoPapelMm, 80),
      altoMm: toNumber(report.AltoMm, 60),
      detalles: details,
    }
  } finally {
    await pool.close()
  }
}

async function insertDetailRows(transaction, document, reportId) {
  const insertSql = `
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
    VALUES (
      @IdReporte,
    @TipoElemento,
    @Campo,
    @TextoFijo,
    @TipoFuente,
    @X,
      @Y,
      @Ancho,
      @Alto,
      @TamanoFuente,
      @Negrita,
      @Italica,
      @Alineacion,
      @Visible,
      @Orden,
      @MaxLineas,
      @Mayuscula,
      GETDATE()
    );
  `

  for (const [index, element] of document.elementos.entries()) {
    const request = new sql.Request(transaction)
    request.input('IdReporte', sql.Int, reportId)
    request.input('TipoElemento', sql.NVarChar(30), mapTypeToSql(element))
    request.input('Campo', sql.NVarChar(50), mapFieldToSql(element.tipo))
    request.input('TextoFijo', sql.NVarChar(250), getFixedText(element))
    request.input('TipoFuente', sql.NVarChar(100), normalizeTipoFuente(element.tipoFuente ?? element.fontFamily))
    request.input('X', sql.Int, Math.round(element.x))
    request.input('Y', sql.Int, Math.round(element.y))
    request.input('Ancho', sql.Int, Math.round(element.width))
    request.input('Alto', sql.Int, Math.round(element.height))
    request.input('TamanoFuente', sql.Int, Math.round(element.fontSize))
    request.input('Negrita', sql.Bit, element.fontWeight === 'bold' ? 1 : 0)
    request.input('Italica', sql.Bit, element.italica === true ? 1 : 0)
    request.input('Alineacion', sql.NVarChar(20), getDetalleAlineacion(element))
    request.input('Visible', sql.Bit, element.visible ? 1 : 0)
    request.input('Orden', sql.Int, index + 1)
    request.input('MaxLineas', sql.Int, getSqlMaxLines(element))
    request.input('Mayuscula', sql.Bit, element.uppercase ? 1 : 0)

    try {
      await request.query(insertSql)
    } catch (insertError) {
      log('SQL detail insert failed', {
        reportId,
        codigo: normalizeReportCode(document.codigo),
        index,
        message: insertError instanceof Error ? insertError.message : insertError,
        element: {
          tipo: element.tipo,
          italica: element.italica,
          text: element.text,
          align: element.align,
          maxLineas: element.maxLineas,
        },
      })
      throw insertError
    }
  }
}

async function saveDocumentToSqlServer(document) {
  if (!isSqlConnectionConfigured()) {
    throw new Error('Faltan datos de conexion SQL. Revisar sql-connection.json o .env.')
  }

  const normalized = normalizeDocument(document)
  log('SQL save requested', {
    codigo: normalized.codigo,
    nombre: normalized.nombre,
    elementos: normalized.elementos.length,
  })

  const pool = createSqlPool()

  await pool.connect()
  const transaction = new sql.Transaction(pool)
  await transaction.begin()

  try {
    const request = new sql.Request(transaction)
    request.input('Codigo', sql.NVarChar(50), normalized.codigo)
    request.input('Nombre', sql.NVarChar(100), normalized.nombre)
    request.input('Descripcion', sql.NVarChar(250), `Layout generado desde EditorScan`)
    request.input('AnchoPapelMm', sql.Int, normalized.anchoPapelMm)
    request.input('AltoMm', sql.Int, normalized.altoPapelMm)
    request.input('Activo', sql.Bit, normalized.activo ? 1 : 0)
    request.input('EsPredeterminado', sql.Bit, normalized.esPredeterminado ? 1 : 0)

    const result = await request.query(`
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

      SELECT IdReporte AS Id
      FROM dbo.Scan_Reporte
      WHERE Codigo = @Codigo;
    `)

    const reportId = result.recordset[0]?.Id
    if (!reportId) {
      throw new Error('No se pudo obtener el IdReporte.')
    }

    log('Scan_Reporte saved', { reportId, codigo: normalized.codigo })

    await new sql.Request(transaction)
      .input('IdReporte', sql.Int, reportId)
      .query('DELETE FROM dbo.Scan_ReporteDetalle WHERE IdReporte = @IdReporte')

    await insertDetailRows(transaction, normalized, reportId)
    log('Scan_ReporteDetalle saved', { reportId, rows: normalized.elementos.length })

    await transaction.commit()
    log('SQL save committed', {
      reportId,
      codigo: normalized.codigo,
      elementos: normalized.elementos.length,
    })

    const report = await loadReportSnapshotByCodigo(normalized.codigo)
    const verification = report ? compareVerificationSnapshots(buildVerificationSnapshotFromDocument(normalized), report) : {
      ok: false,
      mismatches: [{ path: 'report', expected: 'saved report', actual: null }],
    }

    if (!verification.ok) {
      log('SQL verification mismatch', {
        reportId,
        codigo: normalized.codigo,
        summary: verification.mismatches
          .slice(0, 3)
          .map((item) => `${item.path}: esperado ${JSON.stringify(item.expected)} / SQL ${JSON.stringify(item.actual)}`)
          .join(' | '),
        mismatches: verification.mismatches.slice(0, 20),
      })
    } else {
      log('SQL verification passed', { reportId, codigo: normalized.codigo })
    }

    return {
      ok: true,
      reportId,
      codigo: normalized.codigo,
      nombre: normalized.nombre,
      elementCount: normalized.elementos.length,
      savedAt: new Date().toISOString(),
      report,
      verification,
    }
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      log('SQL rollback failed', rollbackError instanceof Error ? rollbackError.message : rollbackError)
    }
    log('SQL save rolled back', error instanceof Error ? error.message : error)
    throw error
  } finally {
    await pool.close()
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    })
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'GET' && url.pathname === '/api/health') {
    const connection = await testSqlConnection()
    json(res, 200, {
      ok: true,
      connection: {
        ...connection,
        config: getPublicSqlConnectionConfig(),
      },
    })
    return
  }

  if (url.pathname === '/api/sql/connection' && req.method === 'GET') {
    const connection = await testSqlConnection()
    json(res, 200, {
      ok: true,
      config: getPublicSqlConnectionConfig(),
      connection,
    })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/sql/articles') {
    try {
      const limit = Number(url.searchParams.get('limit') || 100)
      const payload = await loadSqlPreviewArticles(sqlConnectionConfig, limit)
      json(res, 200, {
        ok: true,
        ...payload,
      })
    } catch (error) {
      log('GET /api/sql/articles failed', error instanceof Error ? error.message : error)
      json(res, 500, {
        ok: false,
        ...errorPayload(error),
      })
    }
    return
  }

  if (url.pathname === '/api/sql/connection' && req.method === 'POST') {
    try {
      const body = await readBody(req)
      const nextConfig = body?.config && typeof body.config === 'object' ? body.config : body
      const publicConfig = updateSqlConnectionConfig(nextConfig)
      const connection = await testSqlConnection()
      json(res, 200, {
        ok: true,
        config: publicConfig,
        connection,
      })
    } catch (error) {
      log('POST /api/sql/connection failed', error instanceof Error ? error.message : error)
      json(res, 500, {
        ok: false,
        ...errorPayload(error),
      })
    }
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/sql/report') {
    try {
      const codigo = url.searchParams.get('codigo') || ''
      if (!codigo.trim()) {
        json(res, 400, {
          ok: false,
          error: 'Falta el parametro codigo.',
        })
        return
      }

      const report = await loadReportSnapshotByCodigo(codigo)
      if (!report) {
        json(res, 404, {
          ok: false,
          error: 'No se encontro una plantilla con ese codigo.',
        })
        return
      }

      json(res, 200, {
        ok: true,
        report,
      })
    } catch (error) {
      log('GET /api/sql/report failed', error instanceof Error ? error.message : error)
      json(res, 500, {
        ok: false,
        ...errorPayload(error),
      })
    }
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/sql/save') {
    try {
      const body = await readBody(req)
      log('POST /api/sql/save', { hasDocument: Boolean(body?.document) })
      const result = await saveDocumentToSqlServer(body.document)
      json(res, 200, result)
    } catch (error) {
      log('POST /api/sql/save failed', error instanceof Error ? error.message : error)
      json(res, 500, {
        ok: false,
        ...errorPayload(error),
      })
    }
    return
  }

  if (req.method === 'GET') {
    await serveProductionApp(req, res, url.pathname)
    return
  }

  text(res, 404, 'Not found')
})

server.on('error', (error) => {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
    console.log(`SQL API already listening on http://127.0.0.1:${PORT}`)
    setInterval(() => {}, 60_000)
    return
  }

  throw error
})

server.listen(PORT, () => {
  console.log(`SQL API listening on http://127.0.0.1:${PORT}`)
})



