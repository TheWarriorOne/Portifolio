<#
deploy-frontend.ps1
Automatiza:
  1) (opcional) npm install
  2) build (npm run build)
  3) aws s3 sync dist/ -> S3 bucket
  4) encontra DistributionId por domínio do CloudFront
  5) cria invalidation /* e espera até Completed (poll)
Usage:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy-frontend.ps1
#>

param(
  [string] $FrontendDir = "D:\Michael-Arquivos\Faculdade-Eng-de-Software\Portifolio\frontend",
  [string] $S3Bucket = "portfolio-michael-varaldo",
  [string] $S3Region = "us-east-2",
  [string] $CloudFrontDomain = "d32ppjbrqo5tv3.cloudfront.net",
  [switch] $SkipNpmInstall  # se fornecido, não roda npm install
)

$ErrorActionPreference = 'Stop'

function Write-Ok($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }
function Write-Info($msg) { Write-Host "[..] $msg" -ForegroundColor Cyan }

Write-Info "Usando frontend dir: $FrontendDir"
if (-not (Test-Path $FrontendDir)) {
  Write-Err "Diretório frontend não encontrado: $FrontendDir"
  exit 1
}

Push-Location $FrontendDir

try {
  # 0) opcional: garantir .env.production existe
  $envFile = Join-Path $FrontendDir ".env.production"
  if (-not (Test-Path $envFile)) {
    Write-Info ".env.production não encontrado — criando com VITE_API_URL apontando para $CloudFrontDomain"
    "VITE_API_URL=https://$CloudFrontDomain" | Set-Content -Path $envFile -Encoding UTF8
  } else {
    Write-Info ".env.production já existe — mantendo."
  }

  # 1) npm install (opcional)
  if (-not $SkipNpmInstall) {
    Write-Info "Instalando dependências (npm install)..."
    $rc = & npm install 2>&1
    if ($LASTEXITCODE -ne 0) {
      Write-Err "npm install terminou com código $LASTEXITCODE. Saída (últimas linhas):"
      $rc[-30..-1] | ForEach-Object { Write-Host $_ }
      Write-Info "Você pode rerodar o script com -SkipNpmInstall se desejar pular esta etapa."
      # não abortar aqui, pois em muitos casos o build ainda funciona
    } else {
      Write-Ok "npm install concluído."
    }
  } else {
    Write-Info "Pulando npm install (--SkipNpmInstall)."
  }

  # 2) build
  Write-Info "Rodando build (npm run build)..."
  $buildOut = & npm run build 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Err "Erro no build. Últimas linhas da saída:"
    $buildOut[-40..-1] | ForEach-Object { Write-Host $_ }
    throw "Build falhou"
  }
  Write-Ok "Build gerado."

  # 3) verificar dist/
  $distPath = Join-Path $FrontendDir "dist"
  if (-not (Test-Path $distPath)) {
    Write-Err "Pasta dist/ não encontrada após build: $distPath"
    throw "dist-not-found"
  }
  Write-Info "Conteúdo dist/:"
  Get-ChildItem $distPath -Recurse | Select-Object FullName,Length | ForEach-Object { Write-Host $_.FullName }

  # 4) procurar referências localhost:3000 no dist (aviso)
  $refs = Get-ChildItem -Recurse -Path $distPath -Include *.* | Select-String -Pattern "localhost:3000" -SimpleMatch -ErrorAction SilentlyContinue
  if ($refs) {
    Write-Err "ATENÇÃO: foram encontradas referências a 'localhost:3000' no build. Verifique e corrija antes de subir."
    $refs | Select-Object Path,LineNumber,Line | ForEach-Object { Write-Host "$($_.Path):$($_.LineNumber) -> $($_.Line.Trim())" }
    throw "found-localhost"
  } else {
    Write-Ok "Nenhuma referência 'localhost:3000' encontrada no build."
  }

  # 5) sync para S3
  Write-Info "Sincronizando dist/ para s3://$S3Bucket (região $S3Region)..."
  $syncCmd = "aws s3 sync `"$distPath`" `"" + "s3://$S3Bucket" + "`" --delete --region $S3Region"
  Write-Info $syncCmd
  $syncOut = Invoke-Expression $syncCmd 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Err "aws s3 sync retornou erro. Saída:"
    $syncOut | ForEach-Object { Write-Host $_ }
    throw "s3-sync-failed"
  }
  Write-Ok "Sync para S3 concluído."

  # 6) encontrar Distribution ID do CloudFront pelo domain
  Write-Info "Procurando DistributionId para o domínio $CloudFrontDomain ..."
  $listJson = aws cloudfront list-distributions --query "DistributionList.Items[?contains(DomainName, \`$CloudFrontDomain\`)].{Id:Id,DomainName:DomainName}" --output json 2>&1
  if ($LASTEXITCODE -ne 0) { Write-Err "Erro ao listar distributions: $listJson"; throw "cf-list-failed" }
  $distList = $listJson | ConvertFrom-Json
  if (-not $distList -or $distList.Count -eq 0) {
    Write-Err "Não encontrei nenhuma distribuição CloudFront com domínio que contenha '$CloudFrontDomain'. Saída raw:"
    Write-Host $listJson
    throw "cf-not-found"
  }
  $DIST_ID = $distList[0].Id
  Write-Ok "DistributionId encontrado: $DIST_ID (DomainName: $($distList[0].DomainName))"

  # 7) criar invalidation
  Write-Info "Criando invalidation (/*) na distribuição $DIST_ID..."
  $invJson = aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*" --output json 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Err "Erro ao criar invalidation: $invJson"
    throw "cf-inv-failed"
  }
  $invObj = $invJson | ConvertFrom-Json
  $INV_ID = $invObj.Invalidation.Id
  Write-Ok "Invalidation criada: $INV_ID. Status inicial: $($invObj.Invalidation.Status)"

  # 8) poll até Completed (timeout razoável)
  $timeoutSec = 600
  $interval = 5
  $elapsed = 0
  Write-Info "Aguardando invalidation completar (timeout ${timeoutSec}s)..."
  while ($true) {
    Start-Sleep -Seconds $interval
    $elapsed += $interval
    $status = aws cloudfront get-invalidation --distribution-id $DIST_ID --id $INV_ID --query 'Invalidation.Status' --output text 2>&1
    if ($LASTEXITCODE -ne 0) {
      Write-Err "Erro ao consultar status da invalidation: $status"
    } else {
      Write-Info "Status: $status (elapsed ${elapsed}s)"
      if ($status -eq "Completed") { break }
    }
    if ($elapsed -ge $timeoutSec) {
      Write-Err "Timeout esperando invalidation completar."
      break
    }
  }

  Write-Ok "Deploy concluído (sync + invalidation). Abra https://$CloudFrontDomain em uma janela anônima e verifique."
  Pop-Location
  exit 0

} catch {
  Write-Err "Erro no deploy: $($_.Exception.Message)"
  Pop-Location
  exit 1
}
