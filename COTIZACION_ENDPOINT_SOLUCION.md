# Soluciones para Endpoint de Cotización

## ❌ Problemas Encontrados

### 1. Error CORS
```
Access to fetch at 'https://oracleapex.com/...' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

**Causa:** Oracle ORDS no tiene configurado CORS para localhost

### 2. Error 500 Internal Server Error
El API devuelve error interno

**Posibles causas:**
- IDs de filtros inválidos
- Parámetros no encontrados en BD
- SQL error

---

## ✅ SOLUCIONES

### **Solución 1: CORS Proxy (Temporal - Para Desarrollo)**

En `Cotizador.tsx`, cambiar:
```typescript
const USE_CORS_PROXY = true; // Activar proxy
```

**Ventajas:** Funciona inmediatamente
**Desventajas:** Lento, no recomendado para producción

---

### **Solución 2: Configurar CORS en Oracle ORDS (Recomendado)**

Contactar al administrador de Oracle ORDS para agregar headers CORS:

```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

O específicamente para tu dominio:
```javascript
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Origin: https://tudominio.com
```

---

### **Solución 3: Backend Proxy (Recomendado para Producción)**

Crear un endpoint en tu backend (Node.js/Express) que actúe como proxy:

```javascript
// backend/routes/cotizacion.js
app.get('/api/cotizacion/:params', async (req, res) => {
  try {
    const oracleUrl = `https://oracleapex.com/ords/josegalvez/paginaweb/cotizacion/${req.params.params}`;
    const response = await fetch(oracleUrl);
    const data = await response.json();
    
    res.set('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Luego en React:
```typescript
const url = `/api/cotizacion/${pathParams}`;
```

---

## 🔍 Validaciones Necesarias

Verificar que los parámetros sean válidos:

1. **Modelo:** Debe existir en BD (ej: "Chevrolet Agile 2011" ✅)
2. **Viscosidad:** Debe existir para el tipo de servicio (ej: "20W50" ✅)
3. **Marca ID:** Debe existir para esa viscosidad (ej: 9 ✅)
4. **Filtro IDs:** Deben existir para ese modelo
   - Filtro Aceite: 25 ❓ (Verificar)
   - Filtro Aire: 25 ❓ (Verificar)
   - Filtro Combustible: 25 ❓ (Verificar)
5. **Aceite ID:** 857 - Debe existir en BD ✅

---

## 📋 Parámetros del Test Actual

```
GET https://oracleapex.com/ords/josegalvez/paginaweb/cotizacion/
  Chevrolet%20Agile%202011/M/20W50/1/9/25/25/25/0/0/857/4/1

Desglose:
- modelo: Chevrolet Agile 2011
- tipoServicio: M (Motor)
- viscosidad: 20W50
- existencia: 1 (Solo stock)
- idMarca: 9
- idMarcaFiltroAceite: 25 ⚠️
- idMarcaFiltroAire: 25 ⚠️
- idMarcaFiltroCombustible: 25 ⚠️
- idMarcaFiltroCaja: 0 ✅
- descuento: 0 ✅
- idAceites: 857
- cantidadLitros: 4
- cantidadGalones: 1
```

---

## 🛠️ Pasos para Resolver

### Paso 1: Verificar IDs de Filtros
```bash
# Ejecutar en BD:
SELECT id_marca, descripcion 
FROM v_REPUESTOS 
WHERE modelo = 'Chevrolet Agile 2011' 
  AND id_rubro IN (7, 8, 18);
```

Los IDs deben ser != 25 o deben existir en la BD

### Paso 2: Habilitar CORS en Oracle
Contactar admin para agregar headers CORS

### Paso 3: Probar con Curl
```bash
curl "https://oracleapex.com/ords/josegalvez/paginaweb/cotizacion/Chevrolet%20Agile%202011/M/20W50/1/9/0/0/0/0/0/857/4/1"
```

Si funciona con filtros en 0, el problema son los IDs de filtros

---

## 📝 Resumen

| Problema | Causa | Solución |
|----------|-------|----------|
| CORS Error | Oracle no configurado | Contactar admin / Backend proxy |
| 500 Error | IDs de filtros inválidos | Verificar en BD |
| Timeout | Servidor lento | Aumentar timeout a 60s |

---

## ✅ Estado Actual

✅ Endpoint está correctamente implementado en React
✅ Parámetros se construyen correctamente
✅ Logs en consola están detallados
✅ Manejo de errores está robusto

⚠️ Falta: Configuración CORS en Oracle
⚠️ Falta: Validar IDs de filtros en BD
