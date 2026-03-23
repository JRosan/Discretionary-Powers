# Azure Deployment Guide

Deploy the BVI Discretionary Powers Management System to Azure using Container Apps, PostgreSQL Flexible Server, and Azure Blob Storage.

## Prerequisites

- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) v2.60+
- [Docker](https://docs.docker.com/get-docker/) installed and running
- An Azure subscription with Contributor access
- `jq` installed (used by the deploy script)

## Quick Deploy

The fastest way to deploy is using the Bicep template with the included script:

```bash
# Log in to Azure
az login

# Run the deployment (prompts for passwords)
./azure/deploy.sh dpms-rg eastus

# Or provide secrets via environment variables
DB_ADMIN_PASSWORD="YourSecurePassword1!" JWT_KEY="your-jwt-key-at-least-32-characters-long" \
  ./azure/deploy.sh dpms-rg eastus
```

The script will:
1. Create a resource group
2. Provision all infrastructure via Bicep (Container Registry, Container Apps, PostgreSQL, Blob Storage)
3. Build and push Docker images
4. Start the application

## Manual Deployment Steps

### 1. Create the Resource Group

```bash
az group create --name dpms-rg --location eastus
```

### 2. Deploy Infrastructure

```bash
az deployment group create \
  --resource-group dpms-rg \
  --template-file azure/main.bicep \
  --parameters \
    dbAdminPassword="YourSecurePassword1!" \
    jwtKey="your-jwt-key-at-least-32-characters-long"
```

### 3. Build and Push Images

```bash
# Get the ACR login server from deployment outputs
ACR_NAME=$(az acr list --resource-group dpms-rg --query "[0].name" -o tsv)
az acr login --name $ACR_NAME
ACR_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)

# Build and push
docker build -t $ACR_SERVER/dpms-api:latest backend/
docker build -t $ACR_SERVER/dpms-frontend:latest -f docker/Dockerfile .
docker push $ACR_SERVER/dpms-api:latest
docker push $ACR_SERVER/dpms-frontend:latest
```

### 4. Update Container Apps

```bash
az containerapp update --name dpms-api --resource-group dpms-rg --image $ACR_SERVER/dpms-api:latest
az containerapp update --name dpms-frontend --resource-group dpms-rg --image $ACR_SERVER/dpms-frontend:latest
```

## GitHub Actions (CI/CD)

The repository includes a deploy workflow at `.github/workflows/deploy.yml`. To use it:

### Required Secrets

Set these in your GitHub repository settings under **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | Service principal JSON credentials for Azure login |

### Required Variables

Set these under **Settings > Secrets and variables > Actions > Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `ACR_NAME` | Azure Container Registry name (without `.azurecr.io`) | `dpmsacrabc123` |
| `RESOURCE_GROUP` | Resource group name | `dpms-rg` |

### Creating Azure Credentials

```bash
az ad sp create-for-rbac \
  --name "dpms-github-deploy" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/dpms-rg \
  --json-auth
```

Copy the JSON output into the `AZURE_CREDENTIALS` secret.

## Environment Variables Reference

### API (Backend)

| Variable | Description | Source |
|----------|-------------|-------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | Bicep secret |
| `Jwt__Key` | JWT signing key | Bicep secret |
| `Jwt__Issuer` | JWT token issuer | `DiscretionaryPowers` |
| `Jwt__Audience` | JWT token audience | `DiscretionaryPowers` |
| `Storage__ConnectionString` | Azure Blob Storage connection string | Bicep secret |
| `Storage__ContainerName` | Blob container name | `documents` |
| `FrontendUrl` | Frontend URL for CORS | Auto-configured |
| `ASPNETCORE_ENVIRONMENT` | Runtime environment | `Production` |

### Frontend

| Variable | Description | Source |
|----------|-------------|-------|
| `NEXT_PUBLIC_API_URL` | API base URL | Auto-configured |

## SSL/TLS

Azure Container Apps provides automatic TLS termination with managed certificates for the `*.azurecontainerapps.io` domain. For custom domains:

```bash
# Add a custom domain
az containerapp hostname add \
  --name dpms-frontend \
  --resource-group dpms-rg \
  --hostname app.example.com

# Bind a managed certificate
az containerapp hostname bind \
  --name dpms-frontend \
  --resource-group dpms-rg \
  --hostname app.example.com \
  --environment dpms-env \
  --validation-method CNAME
```

## Monitoring

Azure Monitor is enabled by default via the Log Analytics workspace. To view logs:

```bash
# Stream API logs
az containerapp logs show --name dpms-api --resource-group dpms-rg --follow

# Query logs in Log Analytics
az monitor log-analytics query \
  --workspace <WORKSPACE_ID> \
  --analytics-query "ContainerAppConsoleLogs_CL | where ContainerAppName_s == 'dpms-api' | top 50 by TimeGenerated"
```

You can also view logs and metrics in the Azure Portal under each Container App's **Monitoring** section.

## Backup Configuration

PostgreSQL Flexible Server includes automatic backups:

- **Retention**: 7 days (configurable up to 35 days in the Bicep template)
- **Type**: Full daily backups with continuous WAL archiving
- **Restore**: Point-in-time restore available via Azure Portal or CLI

To perform a point-in-time restore:

```bash
az postgres flexible-server restore \
  --resource-group dpms-rg \
  --name dpms-db-restored \
  --source-server dpms-db-<suffix> \
  --restore-time "2026-03-20T00:00:00Z"
```

## Scaling

Container Apps scale automatically based on HTTP traffic. The default configuration:

| App | Min Replicas | Max Replicas | Scale Trigger |
|-----|-------------|-------------|---------------|
| API | 1 | 3 | 50 concurrent requests |
| Frontend | 1 | 3 | 100 concurrent requests |

To adjust scaling:

```bash
az containerapp update \
  --name dpms-api \
  --resource-group dpms-rg \
  --min-replicas 2 \
  --max-replicas 10
```

For the database, upgrade the SKU:

```bash
# Upgrade from B1ms to a general-purpose SKU
az postgres flexible-server update \
  --resource-group dpms-rg \
  --name dpms-db-<suffix> \
  --sku-name Standard_D2s_v3 \
  --tier GeneralPurpose
```

## Cost Estimation

Approximate monthly costs for a small deployment (East US):

| Resource | SKU | Estimated Cost |
|----------|-----|---------------|
| Container Apps (API) | 0.5 vCPU, 1 GiB | ~$15/month |
| Container Apps (Frontend) | 0.25 vCPU, 0.5 GiB | ~$8/month |
| PostgreSQL Flexible Server | B1ms (1 vCPU, 2 GiB) | ~$25/month |
| Storage Account | Standard LRS | ~$1/month |
| Container Registry | Basic | ~$5/month |
| Log Analytics | Per-GB ingestion | ~$2-5/month |
| **Total** | | **~$56-59/month** |

Costs vary by region and usage. Use the [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/) for precise estimates.
