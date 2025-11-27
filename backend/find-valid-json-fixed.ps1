# find-valid-json-fixed.ps1
$ErrorActionPreference = 'Stop'
$inputFile = "new-taskdef.json"
$backupFile = "new-taskdef.json.bak"
$outFile = "new-taskdef.json.fixed"

if (-not (Test-Path $inputFile)) {
  Write-Error "$inputFile não encontrado na pasta $(Get-Location)"
  exit 1
}

Copy-Item $inputFile $backupFile -Force
Write-Host "Backup criado em $backupFile"

$txt = Get-Content $inputFile -Raw

# encontra o primeiro '{'
$start = $txt.IndexOf('{')
if ($start -lt 0) {
  Write-Error "Não achei '{' no arquivo."
  exit 1
}

# tenta achar fechamento balanceado inicial
$depth = 0
$firstEnd = $null
for ($i = $start; $i -lt $txt.Length; $i++) {
  $ch = $txt[$i]
  if ($ch -eq '{') { $depth++ }
  elseif ($ch -eq '}') { $depth-- }
  if ($depth -eq 0) { $firstEnd = $i; break }
}

if ($firstEnd -eq $null) {
  Write-Host "Não encontrou fechamento balanceado inicial; começando heurística incremental..."
  $firstEnd = $start
}

$found = $false
$maxLen = [math]::Min($txt.Length, $start + 300000)

for ($end = $firstEnd; $end -lt $maxLen; $end++) {
  $candidate = $txt.Substring($start, $end - $start + 1)
  try {
    $null = $candidate | ConvertFrom-Json
    $found = $true
    $candidate | Set-Content $outFile -Force
    Write-Host ("OK: JSON válido encontrado. Salvando em {0} (length = {1} chars)." -f $outFile, $candidate.Length)
    break
  } catch {
    # continua procurando
  }
}

if (-not $found) {
  Write-Error "Não encontrei um prefixo JSON válido até $maxLen chars. Criado preview para inspeção."
  $preview = $txt.Substring($start, [math]::Min(2000, $txt.Length - $start))
  $preview | Set-Content "$inputFile.preview.txt" -Force
  Write-Host "Preview salvo em $inputFile.preview.txt"
  exit 1
}

try {
  (Get-Content $outFile -Raw) | ConvertFrom-Json | Out-Null
  Move-Item -Path $outFile -Destination $inputFile -Force
  Write-Host "Arquivo original substituído por versão válida. Backup em $backupFile"
} catch {
  Write-Error ("Erro inesperado ao validar {0}: {1}" -f $outFile, $_.Exception.Message)
  exit 1
}
