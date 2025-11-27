# find-valid-json.ps1
# Tenta encontrar o menor prefixo do arquivo new-taskdef.json que seja um JSON válido.
# Salva o resultado em new-taskdef.json.fixed e deixa backup original em new-taskdef.json.bak.
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File .\find-valid-json.ps1

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

# posição inicial para tentativa
$firstEnd = $null
$depth = 0
for ($i = $start; $i -lt $txt.Length; $i++) {
  $ch = $txt[$i]
  if ($ch -eq '{') { $depth++ }
  elseif ($ch -eq '}') { $depth-- }
  if ($depth -eq 0) { $firstEnd = $i; break }
}

if ($firstEnd -eq $null) {
  Write-Host "Não encontrei fechamento balanceado para o primeiro '{'. Vou tentar heurística de parse incremental..."
  $firstEnd = $start
}

# agora tentamos testar parse começando em $firstEnd e expandindo até encontrar um JSON válido
$found = $false
$maxLen = [math]::Min($txt.Length, $start + 300000)  # limite seguro
for ($end = $firstEnd; $end -lt $maxLen; $end++) {
  $candidate = $txt.Substring($start, $end - $start + 1)
  try {
    $null = $candidate | ConvertFrom-Json
    # se não deu exceção, é um JSON válido
    $found = $true
    $candidate | Set-Content $outFile -Force
    Write-Host "OK: JSON válido encontrado. Salvando em $outFile (length = $($candidate.Length) chars)."
    break
  } catch {
    # ignora e continua
    continue
  }
}

if (-not $found) {
  Write-Error "Não encontrei um prefixo válido parseável como JSON até $maxLen chars. Criei backup em $backupFile. Você pode inspecionar manualmente."
  # salvar preview para inspeção
  $preview = $txt.Substring($start, [math]::Min(2000, $txt.Length - $start))
  $preview | Set-Content "$inputFile.preview.txt" -Force
  Write-Host "Preview salvo em $inputFile.preview.txt (2000 chars) para inspeção manual."
  exit 1
}

# validar o arquivo fix e tentar substituir o original
try {
  (Get-Content $outFile -Raw) | ConvertFrom-Json | Out-Null
  Move-Item -Path $outFile -Destination $inputFile -Force
  Write-Host "Arquivo original substituído por versão válida."
} catch {
  Write-Error "Erro inesperado ao validar $outFile: $($_.Exception.Message)"
  exit 1
}
