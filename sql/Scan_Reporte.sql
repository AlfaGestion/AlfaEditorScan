USE [NANODISTRI];
GO

SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.Scan_ReporteDetalle', 'U') IS NOT NULL
  DROP TABLE dbo.Scan_ReporteDetalle;
GO

IF OBJECT_ID('dbo.Scan_Reporte', 'U') IS NOT NULL
  DROP TABLE dbo.Scan_Reporte;
GO

CREATE TABLE dbo.Scan_Reporte (
  IdReporte INT IDENTITY(1,1) NOT NULL,
  Codigo NVARCHAR(50) NOT NULL,
  Nombre NVARCHAR(100) NOT NULL,
  Descripcion NVARCHAR(250) NULL,
  AnchoPapelMm INT NOT NULL CONSTRAINT DF_Scan_Reporte_AnchoPapelMm DEFAULT ((80)),
  AltoMm INT NULL,
  Activo BIT NOT NULL CONSTRAINT DF_Scan_Reporte_Activo DEFAULT ((1)),
  EsPredeterminado BIT NOT NULL CONSTRAINT DF_Scan_Reporte_EsPredeterminado DEFAULT ((0)),
  FechaAlta DATETIME NOT NULL CONSTRAINT DF_Scan_Reporte_FechaAlta DEFAULT (GETDATE()),
  FechaModificacion DATETIME NULL,
  CONSTRAINT PK_Scan_Reporte PRIMARY KEY CLUSTERED (IdReporte),
  CONSTRAINT UQ_Scan_Reporte_Codigo UNIQUE (Codigo)
);
GO

CREATE TABLE dbo.Scan_ReporteDetalle (
  IdDetalle INT IDENTITY(1,1) NOT NULL,
  IdReporte INT NOT NULL,
  TipoElemento NVARCHAR(30) NOT NULL,
  Campo NVARCHAR(50) NULL,
  TextoFijo NVARCHAR(250) NULL,
  X INT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_X DEFAULT ((0)),
  Y INT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_Y DEFAULT ((0)),
  Ancho INT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_Ancho DEFAULT ((100)),
  Alto INT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_Alto DEFAULT ((30)),
  TamanoFuente INT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_TamanoFuente DEFAULT ((18)),
  Negrita BIT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_Negrita DEFAULT ((0)),
  [italica] BIT NULL,
  Alineacion NVARCHAR(20) NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_Alineacion DEFAULT (N'center'),
  Visible BIT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_Visible DEFAULT ((1)),
  Orden INT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_Orden DEFAULT ((0)),
  MaxLineas INT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_MaxLineas DEFAULT ((1)),
  Mayuscula BIT NOT NULL CONSTRAINT DF_Scan_ReporteDetalle_Mayuscula DEFAULT ((0)),
  FechaModificacion DATETIME NULL,
  TipoFuente NVARCHAR(100) NULL,
  CONSTRAINT PK_Scan_ReporteDetalle PRIMARY KEY CLUSTERED (IdDetalle),
  CONSTRAINT FK_Scan_ReporteDetalle_Scan_Reporte FOREIGN KEY (IdReporte) REFERENCES dbo.Scan_Reporte (IdReporte) ON DELETE CASCADE
);
GO

CREATE INDEX IX_Scan_ReporteDetalle_IdReporte_Orden
  ON dbo.Scan_ReporteDetalle (IdReporte, Orden, IdDetalle);
GO

SET IDENTITY_INSERT dbo.Scan_Reporte ON;
INSERT INTO dbo.Scan_Reporte (
  IdReporte,
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
VALUES
  (1, N'gondola', N'Góndola', N'Layout generado desde EditorScan', 80, 60, 1, 0, CONVERT(datetime, '2026-06-09T17:44:03.473', 126), CONVERT(datetime, '2026-06-10T13:49:52.567', 126)),
  (2, N'product', N'Producto', N'Layout generado desde EditorScan', 80, 60, 1, 0, CONVERT(datetime, '2026-06-09T17:44:03.473', 126), CONVERT(datetime, '2026-06-10T13:23:12.040', 126)),
  (3, N'small', N'Chico', N'Etiqueta chica 80mm', 80, NULL, 1, 0, CONVERT(datetime, '2026-06-09T17:44:03.473', 126), NULL),
  (4, N'custom', N'Personalizado', N'Formato personalizado 80mm', 80, NULL, 1, 0, CONVERT(datetime, '2026-06-09T17:44:03.473', 126), NULL);
SET IDENTITY_INSERT dbo.Scan_Reporte OFF;
GO

SET IDENTITY_INSERT dbo.Scan_ReporteDetalle ON;
INSERT INTO dbo.Scan_ReporteDetalle (
  IdDetalle,
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
  [italica],
  Alineacion,
  Visible,
  Orden,
  MaxLineas,
  Mayuscula,
  FechaModificacion,
  TipoFuente
)
VALUES
  (286, 1, N'Dato', N'Empresa', NULL, 2, 0, 316, 24, 13, 1, 1, N'center', 1, 1, 1, 1, CONVERT(datetime, '2026-06-10T13:49:52.573', 126), N'Arial'),
  (287, 1, N'texto', N'Descripcion', NULL, 0, 20, 320, 88, 20, 0, 0, N'center', 1, 2, 3, 1, CONVERT(datetime, '2026-06-10T13:49:52.577', 126), N'Arial'),
  (288, 1, N'precio', N'Precio', NULL, 0, 106, 320, 68, 38, 1, 0, N'right', 1, 3, 1, 0, CONVERT(datetime, '2026-06-10T13:49:52.577', 126), N'Arial'),
  (289, 1, N'codigobarra', N'CodigoBarra', NULL, 12, 168, 308, 48, 58, 1, 0, N'center', 1, 4, 1, 0, CONVERT(datetime, '2026-06-10T13:49:52.577', 126), N'Barcode / Código de barra'),
  (290, 1, N'linea', N'TextoFijo', N'------------', 72, 224, 180, 12, 8, 0, 0, N'left', 1, 5, 1, 0, CONVERT(datetime, '2026-06-10T13:49:52.580', 126), N'Arial'),

  (258, 2, N'texto', N'Descripcion', NULL, 4, 0, 316, 108, 17, 0, 0, N'center', 1, 1, 3, 1, CONVERT(datetime, '2026-06-10T13:23:12.057', 126), N'Roboto'),
  (259, 2, N'precio', N'Precio', NULL, 4, 65, 316, 112, 42, 1, 0, N'center', 1, 2, 1, 0, CONVERT(datetime, '2026-06-10T13:23:12.057', 126), N'Default'),
  (260, 2, N'codigobarra', N'CodigoBarra', NULL, 0, 160, 312, 80, 39, 0, 0, N'center', 1, 3, 1, 0, CONVERT(datetime, '2026-06-10T13:23:12.060', 126), N'Barcode / Código de barra'),

  (11, 3, N'texto', N'Descripcion', NULL, 10, 10, 300, 44, 16, 1, NULL, N'center', 1, 1, 2, 0, NULL, NULL),
  (12, 3, N'precio', N'Precio', NULL, 10, 58, 300, 54, 30, 1, NULL, N'center', 1, 2, 1, 0, NULL, NULL),
  (13, 3, N'texto', N'CodigoArticulo', N'Cod: {CodigoArticulo}', 10, 118, 300, 24, 14, 0, NULL, N'center', 1, 3, 1, 0, NULL, NULL),

  (14, 4, N'texto', N'Empresa', NULL, 10, 8, 300, 26, 16, 1, NULL, N'center', 1, 1, 1, 1, NULL, NULL),
  (15, 4, N'texto', N'Descripcion', NULL, 10, 40, 300, 58, 20, 1, NULL, N'center', 1, 2, 2, 0, NULL, NULL),
  (16, 4, N'precio', N'Precio', NULL, 10, 104, 300, 64, 32, 1, NULL, N'center', 1, 3, 1, 0, NULL, NULL),
  (17, 4, N'texto', N'CodigoArticulo', N'Cod: {CodigoArticulo}', 10, 174, 145, 26, 15, 0, NULL, N'left', 1, 4, 1, 0, NULL, NULL),
  (18, 4, N'texto', N'Stock', N'Stock: {Stock}', 165, 174, 145, 26, 15, 0, NULL, N'right', 1, 5, 1, 0, NULL, NULL),
  (19, 4, N'texto', N'CodigoBarra', N'Barra: {CodigoBarra}', 10, 204, 300, 26, 15, 0, NULL, N'center', 1, 6, 1, 0, NULL, NULL),
  (20, 4, N'texto', N'Fecha', NULL, 10, 234, 300, 22, 13, 0, NULL, N'right', 1, 7, 1, 0, NULL, NULL);
SET IDENTITY_INSERT dbo.Scan_ReporteDetalle OFF;
GO

DBCC CHECKIDENT ('dbo.Scan_Reporte', RESEED, 4);
DBCC CHECKIDENT ('dbo.Scan_ReporteDetalle', RESEED, 290);
GO
