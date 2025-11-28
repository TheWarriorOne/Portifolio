<#
.SYNOPSIS
  Script para buildar a imagem Docker, enviar ao ECR e forçar deploy no ECS (Fargate).

.USAGE
  .\deploy-backend.ps1
  ou com caminho custom:
  .\deploy-backend.ps1 -BackendPath "D:\Michael-Arquivos\Faculdade-Eng-de-Software\Portifolio\backend"

.NOTES
  Requer Docker Desktop em execução e AWS CLI configurado.
#>

param(
  [string]$BackendPath = ".\backend",
  [string]$ImageName = "ecogram-backend",
  [string]$EcrAccount = "113204170412",
  [string]$EcrRegion = "us-east-1",
  [string]$EcrRepo = "ecogram-backend",
  [string]$ClusterName = "ecogram-cluster",
  [string]$ServiceName = "ecogram-service"
)

$ErrorActionPreference = 'Stop'

function Write-Info($msg){
  Write-Host "[INFO] $msg" -ForegroundColor Cyan
}
function Write-Ok($msg){
  Write-Host "[OK]   $msg" -ForegroundColor Green
}
function Write-Err($msg){
  Write-Host "[ERROR] $msg" -ForegroundColor Red
}

try {
  Write-Info "Parâmetros"
  Write-Host " BackendPath  = $BackendPath"
  Write-Host " ImageName    = $ImageName"
  Write-Host " ECR Account  = $EcrAccount"
  Write-Host " ECR Region   = $EcrRegion"
  Write-Host " ECR Repo     = $EcrRepo"
  Write-Host " Cluster      = $ClusterName"
  Write-Host " Service      = $ServiceName"
  Write-Host ""

  # Resolve path
  $absBackendPath = Resolve-Path -Path $BackendPath
  Write-Info "Entrando em: $absBackendPath"
  Set-Location $absBackendPath

  # Check Dockerfile exists
  if (-not (Test-Path -Path "./Dockerfile")) {
    throw "Dockerfile não encontrado em $absBackendPath. Coloque o Dockerfile na pasta correta ou passe -BackendPath correto."
  }
  Write-Ok "Dockerfile encontrado."

  # Build
  $localTag = "$ImageName:latest"
  Write-Info "Build da imagem Docker: $localTag (pode levar alguns minutos)..."
  docker build -t $localTag .

  Write-Ok "Build finalizado."

  # Tag
  $remoteTag = "$EcrAccount.dkr.ecr.$EcrRegion.amazonaws.com/$EcrRepo:latest"
  Write-Info "Tagging: $localTag -> $remoteTag"
  docker tag $localTag $remoteTag
  Write-Ok "Tag aplicada."

  # Login ECR
  Write-Info "Fazendo login no ECR ($EcrAccount.dkr.ecr.$EcrRegion.amazonaws.com)..."
  aws ecr get-login-password --region $EcrRegion | docker login --username AWS --password-stdin "$EcrAccount.dkr.ecr.$EcrRegion.amazonaws.com"
  Write-Ok "Login ECR OK."

  # Push
  Write-Info "Enviando imagem para o ECR: docker push $remoteTag"
  docker push $remoteTag
  Write-Ok "Imagem enviada ao ECR."

  # Forçar deploy no ECS
  Write-Info "Forçando novo deployment no ECS (cluster: $ClusterName, service: $ServiceName)..."
  aws ecs update-service --cluster $ClusterName --service $ServiceName --force-new-deployment --region $EcrRegion
  Write-Ok "Comando de update-service enviado."

  # Show quick status: list new tasks (best effort)
  Write-Info "Listando tasks do serviço (taskArns):"
  $taskArns = aws ecs list-tasks --cluster $ClusterName --service-name $ServiceName --region $EcrRegion --query 'taskArns' --output text
  Write-Host $taskArns
  Write-Info "Verifique logs no CloudWatch (/ecs/$ImageName) e o status do target group no ALB."

  Write-Ok "Deploy concluído (verifique logs/health para confirmar)."
}
catch {
  Write-Err $_.Exception.Message
  exit 1
}
