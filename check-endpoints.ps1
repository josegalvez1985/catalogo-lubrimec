# Verifica cada endpoint del cotizador y mide la velocidad de respuesta.
# Uso: pwsh ./check-endpoints.ps1   (o)   powershell -ExecutionPolicy Bypass -File .\check-endpoints.ps1

$base = "https://oracleapex.com/ords/josegalvez/paginaweb"

# Parametros de ejemplo (ajustar si hace falta segun datos reales)
$modelo = "ChevroletAgile2011"   # modelo SIN espacios (el SQL hace REPLACE)
$visc   = "20W50"
$idMarca = 9
$idAceite = 857

$endpoints = [ordered]@{
  "cotizaModelos"     = "$base/cotizaModelos"
  "viscosidades"      = "$base/viscosidades"
  "cotizaMarcas"      = "$base/cotizaMarcas/1/$visc"
  "aceites"           = "$base/aceites/1/$visc/$idMarca"
  "filtroaceite"      = "$base/filtroaceite/$modelo"
  "filtroaire"        = "$base/filtroaire/$modelo"
  "filtrocombustible" = "$base/filtrocombustible/$modelo"
  "filtrocaja"        = "$base/filtrocaja/$modelo"
  # Orden: idMarcaFiltroCombustible/modelo/galones/litros/idMarcaFiltroCaja/idMarcaFiltroAire/existencia/tipoServicio/idAceites/viscosidad/idMarcaFiltroAceite/descuento
  "cotizacion"        = "$base/cotizacion/0/$modelo/1/4/0/0/1/M/$idAceite/$visc/0/0"
}

"{0,-20} {1,-8} {2,-10} {3}" -f "ENDPOINT","HTTP","MS","ITEMS/INFO"
"-" * 75
$total = 0
foreach ($name in $endpoints.Keys) {
  $url = $endpoints[$name]
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $r = Invoke-WebRequest -Uri $url -TimeoutSec 40 -UseBasicParsing
    $sw.Stop()
    $ms = [math]::Round($sw.Elapsed.TotalMilliseconds)
    $total += $ms
    $info = ""
    try { $j = $r.Content | ConvertFrom-Json; if ($null -ne $j.items) { $info = "$($j.items.Count) items" } else { $info = "sin .items" } } catch { $info = "no-json" }
    "{0,-20} {1,-8} {2,-10} {3}" -f $name, $r.StatusCode, $ms, $info
  } catch {
    $sw.Stop()
    $ms = [math]::Round($sw.Elapsed.TotalMilliseconds)
    $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "000" }
    "{0,-20} {1,-8} {2,-10} {3}" -f $name, $code, $ms, $_.Exception.Message
  }
}
"-" * 75
"Tiempo total acumulado: $total ms"
"`nNota: 'cotizacion' con 0 items = la API responde pero no hay match (revisar params/SQL)."
"      404/500 = endpoint roto. 000 = sin conexion/CORS."
