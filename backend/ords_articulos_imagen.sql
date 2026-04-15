-- =================================================================
-- ORDS Media Resource: GET /paginaweb/articulosimg/:id
-- Sirve el BLOB almacenado en ARTICULOS directamente como imagen.
-- =================================================================
--
-- Ejecutar en SQL Commands de Oracle APEX (o SQLcl).
-- Si el modulo 'paginaweb' ya existe, usar solo DEFINE_TEMPLATE + DEFINE_HANDLER.
-- Si no existe, descomentar DEFINE_MODULE.

BEGIN
  -- Descomentar la siguiente linea si el modulo 'paginaweb' NO existe:
  -- ORDS.DEFINE_MODULE(p_module_name => 'paginaweb', p_base_path => 'paginaweb/', p_items_per_page => 1000);

  -- 1) Crear el template
  ORDS.DEFINE_TEMPLATE(
    p_module_name    => 'paginaweb',
    p_pattern        => 'articulosimg/:id'
  );

  -- 2) Crear el handler Media Resource
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'paginaweb',
    p_pattern        => 'articulosimg/:id',
    p_method         => 'GET',
    p_source_type    => ORDS.source_type_media,
    p_source         => 'SELECT mime_type, archivo_imagen FROM articulos WHERE id_articulo = :id AND cod_empresa = 24'
  );

  COMMIT;
END;
/

-- URL resultante: /ords/josegalvez/paginaweb/articulosimg/174
-- Prueba: abrir en navegador, deberia mostrar la imagen directamente.
-- =================================================================