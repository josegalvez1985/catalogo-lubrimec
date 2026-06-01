# Prueba varias combinaciones del endpoint /cotizacion para detectar cuales devuelven 0 items.
# Editá $casos con combinaciones reales (las que sabés que fallan y las que funcionan).
# Uso: powershell -ExecutionPolicy Bypass -File .\check-cotizacion.ps1

$base = "https://oracleapex.com/ords/josegalvez/paginaweb"

# Orden de params del endpoint:
# idMarcaFiltroCombustible / modelo / galones / litros / idMarcaFiltroCaja / idMarcaFiltroAire / existencia / tipoServicio / idAceites / viscosidad / idMarcaFiltroAceite / descuento
$casos = @(
  # Ejemplos: ajustá modelo, visc, idAceite y los filtros segun los casos reales
  @{ etiqueta="caso A (funciona?)";  fcombustible=0; modelo="ChevroletAgile2011"; galones=1; litros=4; fcaja=0; faire=0;  existencia=1; tipo="M"; aceites="857"; visc="20W50"; faceite=0;  desc=0 }
  @{ etiqueta="caso B (falla?)";     fcombustible=0; modelo="ChevroletAgile2011"; galones=1; litros=4; fcaja=0; faire=25; existencia=1; tipo="M"; aceites="857"; visc="20W50"; faceite=25; desc=0 }
)

foreach ($c in $casos) {
  $path = "$($c.fcombustible)/$($c.modelo)/$($c.galones)/$($c.litros)/$($c.fcaja)/$($c.faire)/$($c.existencia)/$($c.tipo)/$($c.aceites)/$($c.visc)/$($c.faceite)/$($c.desc)"
  $url = "$base/cotizacion/$path"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $r = Invoke-WebRequest -Uri $url -TimeoutSec 40 -UseBasicParsing
    $sw.Stop()
    $j = $r.Content | ConvertFrom-Json
    $n = if ($null -ne $j.items) { $j.items.Count } else { "sin .items" }
    Write-Host ""
    Write-Host ">>> $($c.etiqueta)" -ForegroundColor Cyan
    Write-Host "    URL : $url"
    Write-Host "    HTTP: $($r.StatusCode)   MS: $([math]::Round($sw.Elapsed.TotalMilliseconds))   ITEMS: $n" -ForegroundColor $(if ($n -eq 0) { "Red" } else { "Green" })
  } catch {
    $sw.Stop()
    $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "000" }
    Write-Host ""
    Write-Host ">>> $($c.etiqueta)" -ForegroundColor Cyan
    Write-Host "    URL : $url"
    Write-Host "    HTTP: $code   ERROR: $($_.Exception.Message)" -ForegroundColor Red
  }
}
