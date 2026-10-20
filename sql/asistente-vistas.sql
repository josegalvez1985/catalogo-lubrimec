-- =============================================================================
-- Vistas del asistente de la página web
-- -----------------------------------------------------------------------------
-- Ejecutar en APEX > SQL Workshop > SQL Scripts, conectado al esquema
-- JOSEGALVEZ, ANTES de sql/asistente.sql.
--
-- Son lo único que lee el asistente (PKG_PW_IA), y solo desde búsquedas fijas:
-- la IA no ve estas vistas, sus columnas ni las tablas de abajo, solo los
-- registros que le devuelve cada búsqueda. Tienen lo mismo que ya muestra el
-- sitio, sacado de los mismos endpoints de paginaweb:
--
--   V_PW_IA_RUBROS        el endpoint rubros (los rubros que muestra el
--                         catálogo)
--   V_PW_IA_VISCOSIDADES  el endpoint viscosidades
--   V_PW_IA_PRODUCTOS     articulossinimg con cod_empresa = 24 y es_activo =
--                         N, como lo pide el catálogo, más los nombres de
--                         rubro y viscosidad
--   V_PW_IA_MODELOS       cotizaModelos
--   V_PW_IA_REPUESTOS     filtroaceite / filtroaire / filtrocombustible /
--                         filtrocaja juntos: los filtros de cada modelo
--
-- Las dos primeras se arman con el SQL de su endpoint, leído de ORDS, con los
-- parámetros en NULL (el sitio los llama sin parámetros): así el asistente ve
-- los mismos rubros que el catálogo. Si se cambia uno de esos endpoints, se
-- vuelve a correr este script.
--
-- Diferencias con los endpoints, a propósito:
--   - Precio: precio_venta tal cual; sin precio queda NULL (el endpoint pone
--     1) y el asistente dice que se consulte.
--   - Stock de los repuestos: EXISTENCIA, el mismo que muestra el catálogo
--     (los endpoints de filtros usan pkg_stock.fn_existencia y solo traen los
--     que tienen stock; acá vienen todos, con su stock).
--
-- Idempotente: se puede correr las veces que haga falta.
-- =============================================================================

SET SERVEROUTPUT ON
SET DEFINE OFF


-- 1) Rubros y viscosidades, desde el SQL de su endpoint.
DECLARE
  PROCEDURE desde_endpoint(p_vista IN VARCHAR2, p_plantilla IN VARCHAR2, p_select IN VARCHAR2) IS
    l_src VARCHAR2(32767);
  BEGIN
    SELECT DBMS_LOB.SUBSTR(h.source, 32000, 1)
      INTO l_src
      FROM user_ords_handlers h
      JOIN user_ords_templates t ON t.id = h.template_id
      JOIN user_ords_modules m ON m.id = t.module_id
     WHERE TRIM(BOTH '/' FROM m.uri_prefix) = 'paginaweb'
       AND t.uri_template = p_plantilla
       AND h.method = 'GET';

    -- Sin el punto y coma final, y cada parámetro (:algo) en NULL: es lo que
    -- recibe ORDS cuando el sitio llama sin parámetros.
    l_src := RTRIM(TRIM(l_src), ';' || CHR(9) || CHR(10) || CHR(13) || ' ');
    l_src := REGEXP_REPLACE(l_src, ':([A-Za-z_][A-Za-z0-9_$#]*)', 'NULL');

    -- El salto de línea antes del paréntesis: el SQL puede terminar en un
    -- comentario con --.
    EXECUTE IMMEDIATE 'CREATE OR REPLACE VIEW ' || p_vista || ' AS ' || REPLACE(p_select, '#SRC#', l_src || CHR(10));
    DBMS_OUTPUT.PUT_LINE('[OK]   ' || p_vista || ' (desde el endpoint ' || p_plantilla || ').');
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      DBMS_OUTPUT.PUT_LINE('[ERROR] No está el GET ' || p_plantilla || ' en el módulo paginaweb.');
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('[ERROR] ' || p_vista || ': ' || SQLERRM);
      DBMS_OUTPUT.PUT_LINE('        Pasá el SQL del endpoint ' || p_plantilla || ' para armarla a mano.');
  END desde_endpoint;
BEGIN
  -- Un id una sola vez, aunque el endpoint traiga el mismo rubro de varias
  -- empresas.
  desde_endpoint('v_pw_ia_rubros', 'rubros', q'[
SELECT id_rubro, MIN(descripcion_rubro) AS descripcion_rubro
  FROM (#SRC#)
 GROUP BY id_rubro]');

  desde_endpoint('v_pw_ia_viscosidades', 'viscosidades', q'[
SELECT id_viscosidad, MIN(descripcion) AS descripcion
  FROM (#SRC#)
 GROUP BY id_viscosidad]');
END;
/


-- 2) Productos: articulossinimg, con los filtros que usa el catálogo.
--    Inner join con rubros: el catálogo descarta los artículos de rubros que
--    no vienen en el endpoint rubros.
CREATE OR REPLACE VIEW v_pw_ia_productos AS
SELECT a.descripcion        AS producto,
       r.descripcion_rubro  AS rubro,
       m.descripcion        AS marca,
       v.descripcion        AS viscosidad,
       a.precio_venta       AS precio,
       NVL(a.existencia, 0) AS stock,
       a.cantidad_vendida   AS vendidos
  FROM articulos a
  JOIN marcas m
    ON m.cod_empresa = a.cod_empresa
   AND m.id_marca = a.id_marca
  JOIN v_pw_ia_rubros r
    ON r.id_rubro = a.id_rubro
  LEFT JOIN v_pw_ia_viscosidades v
    ON v.id_viscosidad = a.id_viscosidad
 WHERE a.cod_empresa = '24'
   AND a.es_activo = 'N'
   AND NVL(a.estado, 'I') = 'A';


-- 3) Modelos de vehículo: cotizaModelos.
CREATE OR REPLACE VIEW v_pw_ia_modelos AS
SELECT DISTINCT modelo
  FROM vehiculos_repuestos
 WHERE modelo IS NOT NULL;


-- 4) Filtros por modelo: los cuatro endpoints de filtros juntos, uno por rubro.
CREATE OR REPLACE VIEW v_pw_ia_repuestos AS
SELECT DISTINCT
       c.modelo,
       CASE a.id_rubro
         WHEN 8  THEN 'Filtro de aceite'
         WHEN 7  THEN 'Filtro de aire'
         WHEN 18 THEN 'Filtro de combustible'
         WHEN 17 THEN 'Filtro de caja'
       END                  AS tipo,
       a.descripcion        AS producto,
       m.descripcion        AS marca,
       a.precio_venta       AS precio,
       NVL(a.existencia, 0) AS stock
  FROM v_repuestos c
  JOIN articulos a
    ON a.cod_empresa = c.cod_empresa
   AND a.codigo_oem = c.codigo_oem
  JOIN marcas m
    ON m.cod_empresa = a.cod_empresa
   AND m.id_marca = a.id_marca
 WHERE a.cod_empresa = '24'
   AND a.id_rubro IN (7, 8, 17, 18)
   AND NVL(a.estado, 'I') = 'A';


-- 5) Verificación: que compilen y cuántas filas tienen.
DECLARE
  l_n NUMBER;
BEGIN
  FOR v IN (SELECT 'V_PW_IA_RUBROS' AS nombre FROM dual
            UNION ALL SELECT 'V_PW_IA_VISCOSIDADES' FROM dual
            UNION ALL SELECT 'V_PW_IA_PRODUCTOS' FROM dual
            UNION ALL SELECT 'V_PW_IA_MODELOS' FROM dual
            UNION ALL SELECT 'V_PW_IA_REPUESTOS' FROM dual) LOOP
    BEGIN
      EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM ' || v.nombre INTO l_n;
      DBMS_OUTPUT.PUT_LINE('[OK]   ' || RPAD(v.nombre, 22) || l_n || ' filas');
    EXCEPTION
      WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[ERROR] ' || v.nombre || ': ' || SQLERRM);
    END;
  END LOOP;
END;
/
