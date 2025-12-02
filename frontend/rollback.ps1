$CLUSTER = "arn:aws:ecs:us-east-1:113204170412:cluster/ecogram-cluster"
$FROM_TASKDEF = "ecogram-backend-task:5"
$TO_TASKDEF = "ecogram-backend-task:3"
$region = "us-east-1"

Write-Host "Procurando services no cluster que usam $FROM_TASKDEF ..." -ForegroundColor Cyan

$servicesJson = aws ecs list-services --cluster $CLUSTER --region $region --output json 2>$null
$services = @()
try {
  $parsed = ConvertFrom-Json $servicesJson
  if ($parsed -and $parsed.serviceArns) { $services = $parsed.serviceArns }
} catch {
  $services = @()
}

if ($null -eq $services -or $services.Count -eq 0) {
  Write-Host "Nenhum service encontrado no cluster." -ForegroundColor Yellow
  Read-Host "Pressione ENTER para fechar"
  exit
}

$toRollback = @()

foreach ($svcArn in $services) {
  $descJson = aws ecs describe-services --cluster $CLUSTER --services $svcArn --region $region --output json 2>$null
  if (-not $descJson) { continue }
  try { $desc = ConvertFrom-Json $descJson } catch { $desc = $null }
  if ($null -ne $desc -and $desc.services) {
    foreach ($s in $desc.services) {
      if ($s.taskDefinition -eq $FROM_TASKDEF) {
        $toRollback += $s.serviceName
      }
    }
  }
}

if ($toRollback.Count -eq 0) {
  Write-Host "Nenhum service usando $FROM_TASKDEF foi encontrado. Nada a fazer." -ForegroundColor Yellow
  Read-Host "Pressione ENTER para fechar"
  exit
}

Write-Host "Services que serão revertidos:" -ForegroundColor Green
$toRollback | ForEach-Object { Write-Host "- $_" }

foreach ($svc in $toRollback) {
  Write-Host ""
  Write-Host "Iniciando rollback do service: $svc" -ForegroundColor Cyan
  aws ecs update-service --cluster $CLUSTER --service $svc --task-definition $TO_TASKDEF --force-new-deployment --region $region
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Rollback acionado para $svc -> $TO_TASKDEF" -ForegroundColor Green
  } else {
    Write-Host "Falha ao executar update-service para $svc. Verifique permissões/erros." -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Rollback iniciado com sucesso." -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos úteis para monitorar:"
Write-Host "  aws ecs describe-services --cluster $CLUSTER --services <SERVICE_NAME> --region $region --query 'services[0].events' --output json"
Write-Host "  aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:113204170412:targetgroup/ecogram-tg/cfde34338e07ab64 --region $region --output json"
Write-Host ""
Read-Host "Pressione ENTER para fechar esta janela"
