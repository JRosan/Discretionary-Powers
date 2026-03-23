#!/bin/bash
set -e

RESOURCE_GROUP=${1:-"dpms-rg"}
LOCATION=${2:-"eastus"}
IMAGE_TAG=${3:-"latest"}

echo "=========================================="
echo "  BVI DPMS - Azure Deployment"
echo "=========================================="
echo ""
echo "Resource Group: $RESOURCE_GROUP"
echo "Location:       $LOCATION"
echo "Image Tag:      $IMAGE_TAG"
echo ""

# Prompt for required secrets if not set via environment
if [ -z "$DB_ADMIN_PASSWORD" ]; then
  read -s -p "Enter PostgreSQL admin password: " DB_ADMIN_PASSWORD
  echo ""
fi

if [ -z "$JWT_KEY" ]; then
  read -s -p "Enter JWT signing key (min 32 chars): " JWT_KEY
  echo ""
fi

# Validate JWT key length
if [ ${#JWT_KEY} -lt 32 ]; then
  echo "Error: JWT key must be at least 32 characters."
  exit 1
fi

# Step 1: Create resource group
echo "[1/4] Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

# Step 2: Deploy infrastructure with Bicep
echo "[2/4] Deploying infrastructure (this may take several minutes)..."
DEPLOY_OUTPUT=$(az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$(dirname "$0")/main.bicep" \
  --parameters \
    location="$LOCATION" \
    dbAdminPassword="$DB_ADMIN_PASSWORD" \
    jwtKey="$JWT_KEY" \
    imageTag="$IMAGE_TAG" \
  --output json)

# Extract outputs
ACR_LOGIN_SERVER=$(echo "$DEPLOY_OUTPUT" | jq -r '.properties.outputs.acrLoginServer.value')
API_URL=$(echo "$DEPLOY_OUTPUT" | jq -r '.properties.outputs.apiUrl.value')
FRONTEND_URL=$(echo "$DEPLOY_OUTPUT" | jq -r '.properties.outputs.frontendUrl.value')

# Step 3: Build and push Docker images
echo "[3/4] Building and pushing Docker images..."
az acr login --name "${ACR_LOGIN_SERVER%%.*}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "  Building API image..."
docker build \
  -t "$ACR_LOGIN_SERVER/dpms-api:$IMAGE_TAG" \
  "$PROJECT_ROOT/backend/"

echo "  Building Frontend image..."
docker build \
  -t "$ACR_LOGIN_SERVER/dpms-frontend:$IMAGE_TAG" \
  -f "$PROJECT_ROOT/docker/Dockerfile" \
  "$PROJECT_ROOT"

echo "  Pushing images..."
docker push "$ACR_LOGIN_SERVER/dpms-api:$IMAGE_TAG"
docker push "$ACR_LOGIN_SERVER/dpms-frontend:$IMAGE_TAG"

# Step 4: Update container apps with new images
echo "[4/4] Updating container apps..."
az containerapp update \
  --name dpms-api \
  --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_LOGIN_SERVER/dpms-api:$IMAGE_TAG" \
  --output none

az containerapp update \
  --name dpms-frontend \
  --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_LOGIN_SERVER/dpms-frontend:$IMAGE_TAG" \
  --output none

echo ""
echo "=========================================="
echo "  Deployment Complete"
echo "=========================================="
echo ""
echo "API URL:      $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "ACR Server:   $ACR_LOGIN_SERVER"
echo ""
