import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import sql from 'mssql'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })
dotenv.config()

const PORT = Number(process.env.SQL_API_PORT || 3001)
const SQL_SERVER = process.env.SQL_SERVER || ''
const SQL_DATABASE = process.env.SQL_DATABASE || ''
const SQL_USER = process.env.SQL_USER || ''
const SQL_PASSWORD = process.env.SQL_PASSWORD || ''
const SQL_PORT = Number(process.env.SQL_PORT || 1433)
const SQL_ENCRYPT = String(process.env.SQL_ENCRYPT || 'false').toLowerCase() === 'true'
const SQL_TRUST_SERVER_CERTIFICATE =
  String(process.env.SQL_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true'

function log(message, detail) {
  const timestamp = new Date().toISOString()
  if (detail !== undefined) {
    console.log(`[${timestamp}] ${message}`, detail)
  } else {
    console.log(`[${timestamp}] ${message}`)
  }
}

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

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function isElementType(value) {
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

function mapTypeToSql(tipo) {
  if (tipo === 'codigoBarra') return 'barcode'
  if (tipo === 'logo') return 'logo'
  return 'text'
}

function mapFieldToSql(tipo) {
  switch (tipo) {
    case 'empresa':
      return 'companyName'
    case 'descripcion':
      return 'description'
    case 'precio':
      return 'price'
    case 'codigoArticulo':
      return 'internalCode'
    case 'codigoBarra':
      return 'barcode'
    case 'stock':
      return 'stock'
    case 'fecha':
      return 'date'
    case 'textoFijo':
      return 'textoFijo'
    case 'linea':
      return 'linea'
    case 'logo':
      return 'logo'
    default:
      return null
  }
}

function getFixedText(element) {
  if (element.tipo === 'textoFijo') return element.text || 'Texto fijo'
  if (element.tipo === 'linea') return element.text || '────────'
  if (element.tipo === 'logo') return element.text || 'ALFA'
  return null
}

function getSqlMaxLines(element) {
  if (element.tipo === 'descripcion') return 2
  if (element.tipo === 'textoFijo' || element.tipo === 'linea') return 1
  return 1
}

function normalizeDocument(document) {
  if (!document || typeof document !== 'object') {
    throw new Error('Documento invalido.')
  }

  const elementos = Array.isArray(document.elementos) ? document.elementos : []
  if (elementos.length === 0) {
    throw new Error('El documento no tiene elementos.')
  }

  return {
    codigo: typeof document.codigo === 'string' ? document.codigo : 'gondola',
    nombre: typeof document.nombre === 'string' ? document.nombre : 'Gondola',
    anchoPapelMm: toNumber(document.anchoPapelMm, 80),
    altoPapelMm: toNumber(document.altoPapelMm, 60),
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
        align: item?.align === 'center' || item?.align === 'right' ? item.align : 'left',
        visible: item?.visible !== false,
        color: typeof item?.color === 'string' ? item.color : '#111827',
        text: typeof item?.text === 'string' ? item.text : '',
        imageUrl: typeof item?.imageUrl === 'string' ? item.imageUrl : '',
        lineHeight: toNumber(item?.lineHeight, 1.15),
      }
    }),
  }
}

function getDetailCampo(tipo) {
  return mapFieldToSql(tipo)
}

function getDetalleTextoFijo(element) {
  return getFixedText(element)
}

function getDetalleMaxLineas(element) {
  return getSqlMaxLines(element)
}

function getDetalleAlineacion(element) {
  return element.align || 'left'
}

function buildDetailTable(document, reportId) {
  const table = new sql.Table('dbo.Scan_ReporteDetalle')
  table.create = false
  table.columns.add('IdReporte', sql.Int, { nullable: false })
  table.columns.add('TipoElemento', sql.NVarChar(30), { nullable: false })
  table.columns.add('Campo', sql.NVarChar(50), { nullable: true })
  table.columns.add('TextoFijo', sql.NVarChar(250), { nullable: true })
  table.columns.add('X', sql.Int, { nullable: false })
  table.columns.add('Y', sql.Int, { nullable: false })
  table.columns.add('Ancho', sql.Int, { nullable: false })
  table.columns.add('Alto', sql.Int, { nullable: false })
  table.columns.add('TamanoFuente', sql.Int, { nullable: false })
  table.columns.add('Negrita', sql.Bit, { nullable: false })
  table.columns.add('Alineacion', sql.NVarChar(20), { nullable: false })
  table.columns.add('Visible', sql.Bit, { nullable: false })
  table.columns.add('Orden', sql.Int, { nullable: false })
  table.columns.add('MaxLineas', sql.Int, { nullable: false })
  table.columns.add('Mayuscula', sql.Bit, { nullable: false })
  table.columns.add('FechaModificacion', sql.DateTime, { nullable: true })

  document.elementos.forEach((element, index) => {
    table.rows.add(
      reportId,
      mapTypeToSql(element.tipo),
      getDetailCampo(element.tipo),
      getDetalleTextoFijo(element),
      Math.round(element.x),
      Math.round(element.y),
      Math.round(element.width),
      Math.round(element.height),
      Math.round(element.fontSize),
      element.fontWeight === 'bold' ? 1 : 0,
      getDetalleAlineacion(element),
      element.visible ? 1 : 0,
      index + 1,
      getDetalleMaxLineas(element),
      element.tipo === 'textoFijo' || element.tipo === 'linea' ? 1 : 0,
      new Date(),
    )
  })

  return table
}

async function saveDocumentToSqlServer(document) {
  if (!SQL_SERVER || !SQL_DATABASE || !SQL_USER || !SQL_PASSWORD) {
    throw new Error('Faltan variables de entorno SQL. Revisar .env.local.')
  }

  const normalized = normalizeDocument(document)
  log('SQL save requested', {
    codigo: normalized.codigo,
    nombre: normalized.nombre,
    elementos: normalized.elementos.length,
  })

  const pool = await sql.connect({
    server: SQL_SERVER,
    database: SQL_DATABASE,
    user: SQL_USER,
    password: SQL_PASSWORD,
    port: SQL_PORT,
    options: {
      encrypt: SQL_ENCRYPT,
      trustServerCertificate: SQL_TRUST_SERVER_CERTIFICATE,
    },
  })

  const transaction = new sql.Transaction(pool)
  await transaction.begin()

  try {
    const request = new sql.Request(transaction)
    request.input('Codigo', sql.NVarChar(50), normalized.codigo)
    request.input('Nombre', sql.NVarChar(100), normalized.nombre)
    request.input('Descripcion', sql.NVarChar(250), `Layout generado desde AlfaEditorScan`)
    request.input('AnchoPapelMm', sql.Int, normalized.anchoPapelMm)
    request.input('AltoMm', sql.Int, normalized.altoPapelMm)

    const result = await request.query(`
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

    const detailTable = buildDetailTable(normalized, reportId)
    await new sql.Request(transaction).bulk(detailTable)
    log('Scan_ReporteDetalle saved', { reportId, rows: normalized.elementos.length })

    await transaction.commit()
    log('SQL save committed', {
      reportId,
      codigo: normalized.codigo,
      elementos: normalized.elementos.length,
    })

    return {
      ok: true,
      reportId,
      codigo: normalized.codigo,
      nombre: normalized.nombre,
      elementCount: normalized.elementos.length,
      savedAt: new Date().toISOString(),
    }
  } catch (error) {
    await transaction.rollback()
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
    json(res, 200, { ok: true })
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
        error: error instanceof Error ? error.message : 'Error desconocido.',
      })
    }
    return
  }

  text(res, 404, 'Not found')
})

server.listen(PORT, () => {
  console.log(`SQL API listening on http://127.0.0.1:${PORT}`)
})
