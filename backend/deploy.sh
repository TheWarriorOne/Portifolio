#!/usr/bin/env bash
set -euo pipefail

# ---------------------------
# Windows-safe idempotent deploy
# ---------------------------
REGION="us-east-1"
ACCOUNT_ID="113204170412"

# names (use your names)
PROJECT="ecogram"
VPC_NAME="ecogram-vpc"
CLUSTER_NAME="ecogram-cluster"
SERVICE_NAME="ecogram-service"
TASK_FAMILY="ecogram-backend-task"
LOG_GROUP="ecs/ecogram-backend"   # <-- no leading slash (Windows-safe)
ALB_NAME="ecogram-alb"
TG_NAME="ecogram-tg"
ECR_REPO="ecogram-backend"
IMAGE_TAG="v1.0.1"
DESIRED_COUNT=1

MONGO_PARAM="/ecogram/MONGO_URI"
JWT_PARAM="/ecogram/JWT_SECRET"

CONTAINER_NAME="ecogram-backend"
CONTAINER_PORT=3000

ECR_IMAGE="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"

echo "Deploy Windows-safe iniciado. Região=${REGION} Conta=${ACCOUNT_ID}"
echo "Usando taskdef em ./taskdef.json (verifique se existe e está válido JSON)"

# helper: run aws and exit with readable message
aws_check() {
  if ! command -v aws >/dev/null 2>&1; then
    echo "aws cli não encontrada. Configure antes." >&2
    exit 1
  fi
}
aws_check

# helper para criar role se não existir
ensure_iam_role() {
  local role_name=$1
  local trust_json="$2"   # raw JSON string
  local policy_arn=$3

  if aws iam get-role --role-name "$role_name" --region "$REGION" >/dev/null 2>&1; then
    echo "IAM role ${role_name} já existe"
  else
    echo "Criando IAM role ${role_name}..."
    aws iam create-role --role-name "$role_name" --assume-role-policy-document "$trust_json" --region "$REGION"
    sleep 1
  fi

  # anexar policy se não anexada
  if ! aws iam list-attached-role-policies --role-name "$role_name" --region "$REGION" --query "AttachedPolicies[?PolicyArn=='${policy_arn}']" --output text | grep -q "${policy_arn}"; then
    echo "Anexando policy ${policy_arn} a ${role_name}..."
    aws iam attach-role-policy --role-name "$role_name" --policy-arn "$policy_arn" --region "$REGION"
  else
    echo "Policy ${policy_arn} já anexada a ${role_name}"
  fi
}

# trust policy (raw) — single-line safe
TRUST_POLICY='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

# ---------------------------
# 0) pré-checks
# ---------------------------
# verifica arquivo taskdef
if [ ! -f "./taskdef.json" ]; then
  echo "ERRO: arquivo ./taskdef.json não encontrado. Crie/cole o taskdef.json válido no mesmo diretório." >&2
  exit 1
fi

# ---------------------------
# 1) VPC detect/reuse
# ---------------------------
echo "Procurando VPC com tag Name=${VPC_NAME}..."
EXISTING_VPC_JSON=$(aws ec2 describe-vpcs --region "$REGION" --filters "Name=tag:Name,Values=${VPC_NAME}" || true)
VPC_ID=$(echo "$EXISTING_VPC_JSON" | python -c "import sys,json; j=sys.stdin.read(); d=json.loads(j) if j.strip() else {'Vpcs':[]} ; print(d['Vpcs'][0]['VpcId'] if d.get('Vpcs') else '')" 2>/dev/null || true)

if [ -n "$VPC_ID" ]; then
  echo "Usando VPC existente: $VPC_ID"
else
  echo "Nenhuma VPC encontrada com esse nome — criaremos VPC nova (atenção: custos)."
  VPC_ID=$(aws ec2 create-vpc --region "$REGION" --cidr-block "10.0.0.0/16" --query 'Vpc.VpcId' --output text)
  aws ec2 create-tags --region "$REGION" --resources "$VPC_ID" --tags Key=Name,Value=${VPC_NAME} Key=Project,Value=${PROJECT}
  aws ec2 modify-vpc-attribute --region "$REGION" --vpc-id "$VPC_ID" --enable-dns-hostnames
  echo "VPC criada: $VPC_ID"
fi

# ---------------------------
# 2) Security Groups (idempotent)
# ---------------------------
echo "Criando/recuperando Security Groups..."
# ALB SG
ALB_SG_ID=$(aws ec2 describe-security-groups --region "$REGION" --filters "Name=group-name,Values=${PROJECT}-alb-sg" "Name=vpc-id,Values=${VPC_ID}" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
if [ -z "$ALB_SG_ID" ] || [ "$ALB_SG_ID" = "None" ]; then
  ALB_SG_ID=$(aws ec2 create-security-group --region "$REGION" --group-name ${PROJECT}-alb-sg --description "ALB SG" --vpc-id "$VPC_ID" --query 'GroupId' --output text)
  aws ec2 authorize-security-group-ingress --region "$REGION" --group-id "$ALB_SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 || true
  aws ec2 authorize-security-group-ingress --region "$REGION" --group-id "$ALB_SG_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0 || true
  aws ec2 create-tags --region "$REGION" --resources "$ALB_SG_ID" --tags Key=Name,Value=${PROJECT}-alb-sg Key=Project,Value=${PROJECT}
  echo "ALB_SG criado: $ALB_SG_ID"
else
  echo "ALB_SG já existe: $ALB_SG_ID"
fi

# TASK SG
TASK_SG_ID=$(aws ec2 describe-security-groups --region "$REGION" --filters "Name=group-name,Values=${PROJECT}-task-sg" "Name=vpc-id,Values=${VPC_ID}" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
if [ -z "$TASK_SG_ID" ] || [ "$TASK_SG_ID" = "None" ]; then
  TASK_SG_ID=$(aws ec2 create-security-group --region "$REGION" --group-name ${PROJECT}-task-sg --description "ECS task SG" --vpc-id "$VPC_ID" --query 'GroupId' --output text)
  aws ec2 authorize-security-group-ingress --region "$REGION" --group-id "$TASK_SG_ID" --protocol tcp --port $CONTAINER_PORT --source-group "$ALB_SG_ID" || true
  aws ec2 authorize-security-group-egress --region "$REGION" --group-id "$TASK_SG_ID" --protocol -1 --cidr 0.0.0.0/0 || true
  aws ec2 create-tags --region "$REGION" --resources "$TASK_SG_ID" --tags Key=Name,Value=${PROJECT}-task-sg Key=Project,Value=${PROJECT}
  echo "TASK_SG criado: $TASK_SG_ID"
else
  echo "TASK_SG já existe: $TASK_SG_ID"
fi

# ---------------------------
# 3) IAM roles (idempotent)
# ---------------------------
echo "Garantindo IAM roles..."
ensure_iam_role "${PROJECT}-ecsTaskExecutionRole" "$TRUST_POLICY" "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
ensure_iam_role "${PROJECT}-ecsTaskRole" "$TRUST_POLICY" "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
# attach CloudWatchLogsFullAccess to task role as well (if not attached)
if ! aws iam list-attached-role-policies --role-name "${PROJECT}-ecsTaskRole" --region "$REGION" --query "AttachedPolicies[?PolicyArn=='arn:aws:iam::aws:policy/CloudWatchLogsFullAccess']" --output text | grep -q "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess" 2>/dev/null; then
  aws iam attach-role-policy --role-name "${PROJECT}-ecsTaskRole" --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess --region "$REGION" || true
fi

EXEC_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT}-ecsTaskExecutionRole"
TASK_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT}-ecsTaskRole"

echo "EXEC_ROLE_ARN=${EXEC_ROLE_ARN}"
echo "TASK_ROLE_ARN=${TASK_ROLE_ARN}"

# ---------------------------
# 4) CloudWatch Log Group (Windows-safe name)
# ---------------------------
echo "Criando/verificando CloudWatch Log Group: ${LOG_GROUP}"
aws logs create-log-group --region "$REGION" --log-group-name "$LOG_GROUP" >/dev/null 2>&1 || true
aws logs put-retention-policy --region "$REGION" --log-group-name "$LOG_GROUP" --retention-in-days 30 >/dev/null 2>&1 || true
echo "Log group ok."

# ---------------------------
# 5) Register Task Definition (uses local ./taskdef.json)
# ---------------------------
echo "Registrando Task Definition usando ./taskdef.json ..."
# ensure the ./taskdef.json contains proper executionRoleArn/taskRoleArn placeholders or the real ARNs.
# We'll replace placeholder strings if present (safe sed)
if grep -q "__EXEC_ROLE_ARN__" ./taskdef.json 2>/dev/null; then
  cp ./taskdef.json ./taskdef_tmp.json
  sed -i "s|__EXEC_ROLE_ARN__|${EXEC_ROLE_ARN}|g" ./taskdef_tmp.json
  sed -i "s|__TASK_ROLE_ARN__|${TASK_ROLE_ARN}|g" ./taskdef_tmp.json
  aws ecs register-task-definition --region "$REGION" --cli-input-json file://./taskdef_tmp.json
  rm -f ./taskdef_tmp.json
else
  # assume taskdef.json already has the correct ARNs (or we rely on task role names)
  aws ecs register-task-definition --region "$REGION" --cli-input-json file://./taskdef.json
fi
echo "Task definition registrada."

# get latest taskdef arn for family
TASKDEF_ARN=$(aws ecs list-task-definitions --region "$REGION" --family-prefix "$TASK_FAMILY" --sort DESC --max-items 1 --query 'taskDefinitionArns[0]' --output text)
echo "Latest taskdef: $TASKDEF_ARN"

# ---------------------------
# 6) ECS Cluster (create if not exists)
# ---------------------------
echo "Garantindo ECS cluster ${CLUSTER_NAME}..."
if aws ecs describe-clusters --region "$REGION" --clusters "$CLUSTER_NAME" --query "clusters[0].status" --output text 2>/dev/null | grep -q "ACTIVE"; then
  echo "Cluster ${CLUSTER_NAME} já existe"
else
  aws ecs create-cluster --region "$REGION" --cluster-name "$CLUSTER_NAME" >/dev/null
  echo "Cluster ${CLUSTER_NAME} criado."
fi

# ---------------------------
# 7) ALB / Target Group (reuse if exists)
# ---------------------------
echo "Verificando Target Group ${TG_NAME}..."
TG_ARN=$(aws elbv2 describe-target-groups --region "$REGION" --names "$TG_NAME" --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || true)

if [ -n "$TG_ARN" ] && [ "$TG_ARN" != "None" ]; then
  echo "TargetGroup existente: $TG_ARN"
else
  echo "Criando TargetGroup ${TG_NAME} (target-type ip)..."
  TG_ARN=$(aws elbv2 create-target-group --region "$REGION" --name "$TG_NAME" --protocol HTTP --port $CONTAINER_PORT --vpc-id "$VPC_ID" --target-type ip --health-check-protocol HTTP --health-check-path /api/health --health-check-interval-seconds 15 --matcher HttpCode=200 --query 'TargetGroups[0].TargetGroupArn' --output text)
  echo "TG criado: $TG_ARN"
fi

# ALB (create if not exists)
echo "Verificando ALB ${ALB_NAME}..."
ALB_ARN=$(aws elbv2 describe-load-balancers --region "$REGION" --names "$ALB_NAME" --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || true)
if [ -n "$ALB_ARN" ] && [ "$ALB_ARN" != "None" ]; then
  ALB_DNS=$(aws elbv2 describe-load-balancers --region "$REGION" --load-balancer-arns "$ALB_ARN" --query 'LoadBalancers[0].DNSName' --output text)
  echo "ALB existente: $ALB_ARN (dns: $ALB_DNS)"
else
  # need at least two public subnets to create ALB: try to reuse public subnets tagged in VPC
  echo "Criando ALB ${ALB_NAME}..."
  PUB_SUBNETS=$(aws ec2 describe-subnets --region "$REGION" --filters "Name=vpc-id,Values=${VPC_ID}" "Name=tag:Name,Values=${VPC_NAME}-public*" --query 'Subnets[0:2].SubnetId' --output text || true)
  if [ -z "$PUB_SUBNETS" ] || [ "$PUB_SUBNETS" = "None" ]; then
    # fallback: list any 2 subnets in VPC
    PUB_SUBNETS=$(aws ec2 describe-subnets --region "$REGION" --filters "Name=vpc-id,Values=${VPC_ID}" --query 'Subnets[0:2].SubnetId' --output text)
  fi
  if [ -z "$PUB_SUBNETS" ]; then
    echo "ERRO: não achei subnets públicas na VPC ${VPC_ID}. Crie subnets públicas antes de criar ALB." >&2
    exit 1
  fi
  # take first two tokens
  SUB1=$(echo $PUB_SUBNETS | awk '{print $1}')
  SUB2=$(echo $PUB_SUBNETS | awk '{print $2}')
  ALB_ARN=$(aws elbv2 create-load-balancer --region "$REGION" --name "$ALB_NAME" --subnets "$SUB1" "$SUB2" --security-groups "$ALB_SG_ID" --scheme internet-facing --query 'LoadBalancers[0].LoadBalancerArn' --output text)
  ALB_DNS=$(aws elbv2 describe-load-balancers --region "$REGION" --load-balancer-arns "$ALB_ARN" --query 'LoadBalancers[0].DNSName' --output text)
  echo "ALB criado: $ALB_ARN (dns: $ALB_DNS)"
fi

# ensure listener exists for HTTP 80
LISTENER_ARN=$(aws elbv2 describe-listeners --region "$REGION" --load-balancer-arn "$ALB_ARN" --query "Listeners[?Port==\`80\`].ListenerArn | [0]" --output text 2>/dev/null || true)
if [ -z "$LISTENER_ARN" ] || [ "$LISTENER_ARN" = "None" ]; then
  echo "Criando listener HTTP:80 apontando para ${TG_ARN}..."
  aws elbv2 create-listener --region "$REGION" --load-balancer-arn "$ALB_ARN" --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn="$TG_ARN" >/dev/null
else
  echo "Listener 80 já existe no ALB."
fi

# ---------------------------
# 8) ECS Service (create or update)
# ---------------------------
echo "Verificando service ${SERVICE_NAME} no cluster ${CLUSTER_NAME}..."
SERVICE_ARN=$(aws ecs describe-services --region "$REGION" --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" --query 'services[0].serviceArn' --output text 2>/dev/null || true)

if [ -z "$SERVICE_ARN" ] || [ "$SERVICE_ARN" = "None" ]; then
  echo "Criando ECS service ${SERVICE_NAME}..."
  aws ecs create-service \
    --region "$REGION" \
    --cluster "$CLUSTER_NAME" \
    --service-name "$SERVICE_NAME" \
    --task-definition "$TASKDEF_ARN" \
    --desired-count "$DESIRED_COUNT" \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[${PRIV1:-}],securityGroups=[${TASK_SG_ID}],assignPublicIp=DISABLED}" \
    --load-balancers "targetGroupArn=${TG_ARN},containerName=${CONTAINER_NAME},containerPort=${CONTAINER_PORT}" \
    --deployment-configuration "maximumPercent=200,minimumHealthyPercent=50" >/dev/null
  echo "Service criado."
else
  echo "Service já existe. Atualizando service para usar taskDefinition ${TASKDEF_ARN}..."
  aws ecs update-service --region "$REGION" --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --task-definition "$TASKDEF_ARN" --desired-count "$DESIRED_COUNT" >/dev/null
  echo "Service atualizado (deploy em andamento)."
fi

# ---------------------------
# 9) Final checks & instructions
# ---------------------------

echo "======================================"
echo "Deploy finalizado — verifique o status:"
echo "Cluster: ${CLUSTER_NAME}"
echo "Service: ${SERVICE_NAME}"
echo "Task definition: ${TASKDEF_ARN}"
echo "ALB DNS (se criado/recuperado):"
if [ -n "${ALB_DNS-}" ]; then
  echo "  http://${ALB_DNS}"
fi
echo ""
echo "Comandos úteis:"
echo " aws ecs list-tasks --cluster ${CLUSTER_NAME} --region ${REGION}"
echo " aws ecs describe-tasks --cluster ${CLUSTER_NAME} --region ${REGION} --tasks <taskArn>"
echo " aws elbv2 describe-target-health --target-group-arn ${TG_ARN} --region ${REGION}"
echo " aws logs tail ${LOG_GROUP} --region ${REGION} --follow"
echo ""
echo "IMPORTANTE:"
echo " - Se o service usar subnets privadas e o container precisa falar com MongoDB Atlas, garanta NAT/EIP existente e que o EIP esteja na IP Access List do Atlas."
echo " - Se health checks ficarem UNHEALTHY, verifique logs (CloudWatch) e variáveis de ambiente/SSM."
echo "======================================"

exit 0
