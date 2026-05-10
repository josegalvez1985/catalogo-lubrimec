# ✅ Verificación de Endpoint ORDS vs SQL Funcional

## 📋 Parámetros en ORDS

Ruta de acceso: `/paginaweb/cotizacion/:modelo/:tipoServicio/:viscosidad/:existencia/:idMarca/:idMarcaFiltroAceite/:idMarcaFiltroAire/:idMarcaFiltroCombustible/:idMarcaFiltroCaja/:descuento/:idAceites/:cantidadLitros/:cantidadGalon`

**Orden esperado:**
1. modelo
2. tipoServicio
3. viscosidad
4. existencia
5. idMarca
6. idMarcaFiltroAceite
7. idMarcaFiltroAire
8. idMarcaFiltroCombustible
9. idMarcaFiltroCaja
10. descuento
11. idAceites
12. cantidadLitros
13. cantidadGalon

---

## 🔍 Verificación con Valores Reales

**URL enviada desde React:**
```
https://oracleapex.com/ords/josegalvez/paginaweb/cotizacion/
Chevrolet%20Montana%202012/M/20W50/1/9/25/25/25/0/0/857/4/1
```

**Desglose por parámetro:**
| # | Parámetro | Valor Enviado | Valor Esperado | ✅/❌ |
|---|-----------|---------------|----------------|-------|
| 1 | modelo | Chevrolet Montana 2012 | Chevrolet Montana 2012 | ✅ |
| 2 | tipoServicio | M | M (motor) | ✅ |
| 3 | viscosidad | 20W50 | 20W50 | ✅ |
| 4 | existencia | 1 | 1 (Solo Stock) | ✅ |
| 5 | idMarca | 9 | 9 | ✅ |
| 6 | idMarcaFiltroAceite | 25 | 25 | ✅ |
| 7 | idMarcaFiltroAire | 25 | 25 | ✅ |
| 8 | idMarcaFiltroCombustible | 25 | 25 | ✅ |
| 9 | idMarcaFiltroCaja | 0 | 0 (no aplica) | ✅ |
| 10 | descuento | 0 | 0 | ✅ |
| 11 | idAceites | 857 | 857 | ✅ |
| 12 | cantidadLitros | 4 | 4 | ✅ |
| 13 | cantidadGalon | 1 | 1 | ✅ |

---

## 📊 Respuesta Esperada del Endpoint

El endpoint debe retornar un JSON con esta estructura basado en el SQL:

```json
{
  "resultado": {
    "aceites": [
      {
        "id": 857,
        "nombre": "VALVOLINE PREMIUN PROTECTION 20W50 LITRO",
        "precioBase": 63190,
        "stock": 8,
        "unidad": "LT",
        "imagen": null
      }
    ],
    "filtros": {
      "aceite": {
        "id": 25,
        "nombre": "FILTRO ACEITE (descripción)",
        "precio": 24030,
        "imagen": null
      },
      "aire": {
        "id": 25,
        "nombre": "FILTRO AIRE (descripción)",
        "precio": 51620,
        "imagen": null
      },
      "combustible": {
        "id": 25,
        "nombre": "FILTRO COMBUSTIBLE (descripción)",
        "precio": 46280,
        "imagen": null
      },
      "caja": null
    },
    "totales": {
      "sinDescuento": 421000,
      "conDescuento": 351970,
      "porcentajeDescuento": 16.4
    }
  }
}
```

---

## 🛠️ Acciones

**CORS Problem:**
- ❌ El endpoint está en `oracleapex.com`
- ❌ React en `localhost:8080` no puede acceder sin CORS headers
- ✅ Pero el SQL funciona correctamente en Oracle

**Solución:**
Agregar headers CORS a ORDS para permitir:
```
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

O usar CORS proxy.
