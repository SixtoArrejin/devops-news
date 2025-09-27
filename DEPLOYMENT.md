# 🚀 Deployment en Azure - Configuración de Secrets

Este documento explica cómo configurar los secrets necesarios en GitHub para el deployment automático en Azure.

## 📋 Secrets Requeridos

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions** y agrega estos secrets:

### 🔐 Azure Container Registry (ACR)

```
ACR_LOGIN_SERVER=tu-registry.azurecr.io
ACR_USERNAME=tu-registry-username
ACR_PASSWORD=tu-registry-password
```

### ☁️ Azure Service Principal

```
AZURE_CREDENTIALS={
  "clientId": "tu-client-id",
  "clientSecret": "tu-client-secret",
  "subscriptionId": "tu-subscription-id",
  "tenantId": "tu-tenant-id",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### 🏗️ Azure Resource Group

```
AZURE_RESOURCE_GROUP=tu-resource-group-name
```

### 📰 NewsAPI

```
NEWS_API_KEY=tu-newsapi-key-desde-newsapi.org
```

### 🗄️ Redis

```
REDIS_PASSWORD=tu-password-seguro-para-redis
```

## 🛠️ Cómo Crear los Recursos en Azure

### 1. Crear Resource Group

```bash
az group create --name devops-news-rg --location eastus
```

### 2. Crear Azure Container Registry

```bash
az acr create --resource-group devops-news-rg --name devopsnewsregistry --sku Basic --admin-enabled true
```

### 3. Obtener credenciales del ACR

```bash
# Obtener login server
az acr show --name devopsnewsregistry --resource-group devops-news-rg --query loginServer

# Obtener credenciales
az acr credential show --name devopsnewsregistry --resource-group devops-news-rg
```

### 4. Crear Service Principal para GitHub Actions

```bash
az ad sp create-for-rbac --name "github-actions-devops-news" --role contributor --scopes /subscriptions/TU-SUBSCRIPTION-ID/resourceGroups/devops-news-rg --sdk-auth
```

### 5. Obtener NewsAPI Key

1. Ve a [https://newsapi.org/](https://newsapi.org/)
2. Regístrate gratis
3. Copia tu API Key desde el dashboard

## 🎯 Estructura del Deployment

El workflow despliega 3 contenedores en Azure Container Instances:

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure Container Instances              │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Redis         │   API Backend   │      Frontend           │
│   Port: 6379    │   Port: 3000    │      Port: 80           │
│   (Storage)     │   (Express)     │      (Nginx + React)    │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 🔄 Flujo de Deployment

1. **Push a main/deploy** → Activa el workflow
2. **Build Images** → Construye las 3 imágenes Docker
3. **Push to ACR** → Sube imágenes al registry de Azure
4. **Deploy Redis** → Despliega Redis con persistencia
5. **Deploy API** → Despliega backend conectado a Redis
6. **Deploy Frontend** → Despliega frontend conectado a API

## 📍 URLs de Acceso

Después del deployment exitoso:

- **Frontend**: `http://devops-news-frontend.eastus.azurecontainer.io`
- **API**: `http://devops-news-api.eastus.azurecontainer.io:3000`
- **Redis**: `devops-news-redis.eastus.azurecontainer.io:6379`

## 🔧 Troubleshooting

### Ver logs de contenedores

```bash
# API logs
az container logs --resource-group devops-news-rg --name devops-news-api

# Frontend logs
az container logs --resource-group devops-news-rg --name devops-news-frontend

# Redis logs
az container logs --resource-group devops-news-rg --name devops-news-redis
```

### Restart contenedores

```bash
az container restart --resource-group devops-news-rg --name devops-news-api
```

### Ver estado

```bash
az container show --resource-group devops-news-rg --name devops-news-api --query instanceView.state
```

## 🔒 Seguridad

- ✅ Service Principal con permisos mínimos
- ✅ Secrets encriptados en GitHub
- ✅ Redis con password
- ✅ API sin usuario root
- ✅ Registry privado en Azure

## 📝 Notas Importantes

1. **Costos**: Azure Container Instances cobra por segundo de uso
2. **Región**: Configurado para East US, cambiar si necesario
3. **Scaling**: Para producción considera Azure Container Apps o AKS
4. **Persistencia**: Redis usa `--appendonly yes` para persistir datos
5. **DNS**: Los nombres DNS deben ser únicos globalmente en Azure
