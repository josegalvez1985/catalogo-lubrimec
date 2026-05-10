-- SQL CON VALORES REALES PARA DEBUG
-- Parámetros:
-- modelo: 'Chevrolet Montana 2012'
-- tipoServicio: 'M'
-- viscosidad: '20W50'
-- existencia: 1
-- idMarca: 9
-- idMarcaFiltroAceite: 25
-- idMarcaFiltroAire: 25
-- idMarcaFiltroCombustible: 25
-- idMarcaFiltroCaja: 0
-- descuento: 0
-- idAceites: '857'
-- cantidadLitros: 4
-- cantidadGalones: 1

-- ❌ PROBLEMA 1: SQL muy complejo con UNION y duplicación
-- ❌ PROBLEMA 2: Los filtros (id_rubro 7,8,17,18) podrían no existir
-- ❌ PROBLEMA 3: Function pkg_ventas.FN_PORC_DESCUENTO desconocida

-- VERSIÓN SIMPLIFICADA (SIN UNION):
SELECT
    b.articulo,
    b.id_articulo,
    b.total_aceite,
    b.viscosidad,
    b.stock,
    filtros.filtro_aceite,
    filtros.filtro_aire,
    filtros.filtro_combustible,
    filtros.filtro_caja
FROM v_LUBRICANTES b
INNER JOIN (
    SELECT
        a.modelo,
        a.cod_empresa,
        MAX(CASE WHEN a.id_rubro = 8 THEN a.filtro_aceite ELSE 0 END) filtro_aceite,
        MAX(CASE WHEN a.id_rubro = 7 THEN a.filtro_aire ELSE 0 END) filtro_aire,
        MAX(CASE WHEN a.id_rubro = 18 THEN a.filtro_combustible ELSE 0 END) filtro_combustible,
        MAX(CASE WHEN a.id_rubro = 17 THEN a.filtro_caja ELSE 0 END) filtro_caja
    FROM v_REPUESTOS a
    WHERE a.cod_empresa = '24'
        AND a.modelo = 'Chevrolet Montana 2012'
    GROUP BY a.modelo, a.cod_empresa
) filtros ON filtros.cod_empresa = b.cod_empresa
WHERE b.cod_empresa = '24'
    AND b.id_rubro = 1  -- Motor
    AND filtros.modelo = 'Chevrolet Montana 2012'
    AND b.viscosidad = '20W50'
    AND b.stock > 1
    AND b.id_articulo = 857;

-- VERIFICACIONES:
-- 1. ¿Existe el modelo 'Chevrolet Montana 2012' en v_REPUESTOS?
SELECT DISTINCT modelo FROM v_REPUESTOS WHERE cod_empresa = '24' AND modelo LIKE '%Montana%';

-- 2. ¿Existen los id_rubro para filtros?
SELECT DISTINCT id_rubro FROM v_REPUESTOS WHERE modelo = 'Chevrolet Montana 2012';

-- 3. ¿Existe el aceite 857 con viscosidad 20W50?
SELECT * FROM v_LUBRICANTES
WHERE id_articulo = 857
  AND viscosidad = '20W50'
  AND cod_empresa = '24';

-- 4. ¿Qué retorna si quitamos el stock > 1?
SELECT * FROM v_LUBRICANTES
WHERE id_articulo = 857
  AND viscosidad = '20W50'
  AND cod_empresa = '24';
