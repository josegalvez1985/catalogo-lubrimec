-- =============================================================================
-- Contador de visitas de la página web
-- -----------------------------------------------------------------------------
-- Ejecutar en APEX > SQL Workshop > SQL Scripts, conectado al esquema JOSEGALVEZ.
--
-- Un único contador acumulado (no se separa por día), que arranca en 1865.
--
-- Endpoints que quedan publicados (mismo módulo que el resto de la web):
--   GET  /ords/josegalvez/paginaweb/visitas?cod_empresa=24  -> lee el contador
--   POST /ords/josegalvez/paginaweb/visitas?cod_empresa=24  -> suma 1 y lo devuelve
-- Ambos responden: {"total": 1866}
--
-- El front hace POST una sola vez por sesión del navegador y GET el resto.
--
-- El script se puede volver a ejecutar sin romper nada ni reiniciar el
-- contador: crea sólo lo que falta y redefine los handlers.
-- =============================================================================


-- 1) Tabla: una sola fila por empresa con el total acumulado.
--    Si existe la versión vieja (una fila por día, con columna FECHA) se
--    reemplaza; si ya existe la nueva, no se toca.
DECLARE
  l_version_vieja NUMBER;
  l_existe        NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO l_version_vieja
    FROM user_tab_columns
   WHERE table_name = 'PW_VISITAS'
     AND column_name = 'FECHA';

  IF l_version_vieja > 0 THEN
    EXECUTE IMMEDIATE 'DROP TABLE pw_visitas PURGE';
  END IF;

  SELECT COUNT(*) INTO l_existe FROM user_tables WHERE table_name = 'PW_VISITAS';

  IF l_existe = 0 THEN
    EXECUTE IMMEDIATE q'[
      CREATE TABLE pw_visitas (
        cod_empresa  VARCHAR2(10) NOT NULL,
        visitas      NUMBER       DEFAULT 0 NOT NULL,
        CONSTRAINT pw_visitas_pk PRIMARY KEY (cod_empresa)
      )]';
  END IF;
END;
/

COMMENT ON TABLE  pw_visitas         IS 'Contador de visitas de la página web por empresa';
COMMENT ON COLUMN pw_visitas.visitas IS 'Total acumulado de sesiones de navegador que entraron al sitio';


-- 2) Valor inicial: el contador arranca en 1865. Si la fila ya existe no se
--    toca, así volver a correr el script no reinicia el contador.
MERGE INTO pw_visitas d
USING (SELECT '24' AS cod_empresa FROM dual) s
   ON (d.cod_empresa = s.cod_empresa)
 WHEN NOT MATCHED THEN
   INSERT (cod_empresa, visitas) VALUES (s.cod_empresa, 1865);
COMMIT;


-- 3) Endpoint ORDS. Busca solo el nombre del módulo "paginaweb" para no
--    depender de cómo se llamó al crearlo. La ruta "visitas" se crea sólo si
--    no existe; los handlers GET y POST se redefinen siempre (DEFINE_HANDLER
--    reemplaza el que haya).
DECLARE
  l_modulo  user_ords_modules.name%TYPE;
  l_existe  NUMBER;
BEGIN
  SELECT name
    INTO l_modulo
    FROM user_ords_modules
   WHERE TRIM(BOTH '/' FROM uri_prefix) = 'paginaweb';

  SELECT COUNT(*)
    INTO l_existe
    FROM user_ords_templates t
    JOIN user_ords_modules m ON m.id = t.module_id
   WHERE m.name = l_modulo
     AND t.uri_template = 'visitas';

  IF l_existe = 0 THEN
    ORDS.DEFINE_TEMPLATE(
      p_module_name => l_modulo,
      p_pattern     => 'visitas',
      p_etag_type   => 'NONE',   -- sin ETag: el contador cambia todo el tiempo
      p_comments    => 'Contador de visitas de la página web'
    );
  END IF;

  -- GET: sólo lee. MAX() garantiza una fila (0) aunque la empresa no exista.
  ORDS.DEFINE_HANDLER(
    p_module_name    => l_modulo,
    p_pattern        => 'visitas',
    p_method         => 'GET',
    p_source_type    => ORDS.source_type_query_one_row,
    p_items_per_page => 0,
    p_source         => q'[
SELECT NVL(MAX(visitas), 0) AS total
  FROM pw_visitas
 WHERE cod_empresa = NVL(:cod_empresa, '24')
]'
  );

  -- POST: suma una visita y devuelve el total actualizado.
  ORDS.DEFINE_HANDLER(
    p_module_name => l_modulo,
    p_pattern     => 'visitas',
    p_method      => 'POST',
    p_source_type => ORDS.source_type_plsql,
    p_source      => q'[
DECLARE
  l_empresa pw_visitas.cod_empresa%TYPE := NVL(:cod_empresa, '24');
  l_total   NUMBER;
BEGIN
  UPDATE pw_visitas
     SET visitas = visitas + 1
   WHERE cod_empresa = l_empresa
  RETURNING visitas INTO l_total;

  -- Empresa sin fila todavía: se crea con la primera visita.
  IF SQL%ROWCOUNT = 0 THEN
    INSERT INTO pw_visitas (cod_empresa, visitas) VALUES (l_empresa, 1);
    l_total := 1;
  END IF;

  COMMIT;

  owa_util.mime_header('application/json', TRUE);
  htp.p('{"total":' || l_total || '}');
END;
]'
  );

  COMMIT;
END;
/


-- Para corregir el número a mano:
-- UPDATE pw_visitas SET visitas = 1865 WHERE cod_empresa = '24';
-- COMMIT;
