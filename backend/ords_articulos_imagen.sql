-- ORDS handler PL/SQL: GET /articulos/{id}/imagen
-- Devuelve el BLOB almacenado en ARTICULOS. Asegura CORS y Content-Type.

DECLARE
  l_blob   BLOB;
  l_mime   VARCHAR2(255) := 'application/octet-stream';
  l_nombre VARCHAR2(500) := 'imagen';
BEGIN
  BEGIN
    SELECT archivo_imagen, mime_type, nombre_imagen
      INTO l_blob, l_mime, l_nombre
    FROM articulos
    WHERE id_articulo = :id
      AND cod_empresa = 24;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      -- Retornar 404
      owa_util.mime_header('text/plain', FALSE);
      htp.p('Access-Control-Allow-Origin: *');
      htp.p('Access-Control-Allow-Methods: GET, OPTIONS');
      htp.p('Access-Control-Allow-Headers: Content-Type');
      owa_util.http_header_close;
      htp.p('Imagen no encontrada');
      RETURN;
  END;

  -- Cabeceras CORS y tipo
  owa_util.mime_header(nvl(l_mime,'application/octet-stream'), FALSE);
  htp.p('Access-Control-Allow-Origin: *');
  htp.p('Access-Control-Allow-Methods: GET, OPTIONS');
  htp.p('Access-Control-Allow-Headers: Content-Type');
  -- Inline para mostrar en navegador; cambiar a attachment si quieres forzar descarga
  htp.p('Content-Disposition: inline; filename="' || nvl(l_nombre,'imagen') || '"');
  owa_util.http_header_close;

  -- Enviar BLOB
  wpg_docload.download_file(l_blob);
EXCEPTION
  WHEN OTHERS THEN
    -- Manejar error interno
    owa_util.mime_header('text/plain', FALSE);
    htp.p('Access-Control-Allow-Origin: *');
    htp.p('Access-Control-Allow-Methods: GET, OPTIONS');
    htp.p('Access-Control-Allow-Headers: Content-Type');
    owa_util.http_header_close;
    htp.p('Error interno: '||SQLERRM);
END;
/

-- NOTAS:
-- 1) Ajusta el nombre del módulo/resource en ORDS para exponerlo en /ords/<schema>/<module>/articulos/:id/imagen
-- 2) En producción sustituye 'Access-Control-Allow-Origin: *' por el dominio del frontend.
-- 3) Añade soporte para OPTIONS si tu ORDS no lo gestiona automáticamente.
