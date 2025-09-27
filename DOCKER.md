# DevOps News - Docker Setup

Esta guía te ayudará a ejecutar DevOps News usando Docker y Docker Compose.

## 🐳 Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- Clave de [NewsAPI](https://newsapi.org/) (gratuita)

## ⚙️ Configuración Rápida

### 1. Configurar Variables de Entorno

El archivo `.env` ya existe en la raíz del proyecto. Solo necesitas agregar tu clave de NewsAPI:

```bash
# Editar el archivo .env
nano .env
```

Configurar tu clave en `.env`:

```env
NEWS_API_KEY=tu-newsapi-key-aqui
```

### 2. Ejecutar con Docker Compose

```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build
```

### 3. Acceder a la Aplicación

- **Frontend:** http://localhost:80 (puerto 80)
- **API:** http://localhost:3000
- **Redis:** localhost:6379

## 📋 Comandos Docker Compose

### Comandos Básicos

```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Solo iniciar servicios (sin rebuild)
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f redis

# Ver estado de servicios
docker-compose ps

# Detener servicios
docker-compose down

# Detener servicios y eliminar volúmenes
docker-compose down -v
```

### Comandos para Actualizaciones

```bash
# Reiniciar con rebuild (cuando hay cambios en el código)
docker-compose down
docker-compose up -d --build

# Rebuild sin caché (para problemas)
docker-compose build --no-cache
docker-compose up -d
```

## 🏗️ Arquitectura de Contenedores

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │      API        │    │     Redis       │
│   (Nginx)       │    │   (Node.js)     │    │    (Cache)      │
│   Port: 80      │◄──►│   Port: 3000    │◄──►│   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Servicios

1. **Frontend (`devops-news-frontend`)**

   - **Build Stage**: Node.js 20 Bullseye (para construir)
   - **Runtime**: Nginx Alpine (para servir)
   - **Puerto**: 80
   - **Funcionalidad**: Multi-stage build que construye la aplicación React con Vite y la sirve con Nginx
   - **Proxy**: Nginx hace proxy de `/api/*` al backend usando variable `API_URL`
   - **Configuración dinámica**: Nginx se configura al inicio usando `envsubst`

2. **API (`devops-news-api`)**

   - **Imagen**: Node.js 20 Alpine
   - **Puerto**: 3000
   - **Funcionalidad**: Backend con Express + Redis
   - **Seguridad**: Ejecuta con usuario no-root

3. **Redis (`devops-news-redis`)**
   - **Imagen**: Redis 7 Alpine
   - **Puerto**: 6379
   - **Funcionalidad**: Caché y almacenamiento de datos
   - **Persistencia**: Datos guardados en volumen `redis_data`

## 🔧 Desarrollo

### Desarrollo Local vs Docker

**Para desarrollo activo** (recomendado):

```bash
# Backend
cd devops-news-api
npm run dev

# Frontend
cd devops-news-app
npm run dev
```

**Para testing de producción**:

```bash
docker-compose up -d --build
```

### Actualizar Después de Cambios de Código

Si haces cambios en el código y quieres ver los cambios en Docker:

```bash
# Detener, rebuild e iniciar
docker-compose down
docker-compose up -d --build

# Con rebuild sin caché (si hay problemas)
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoreo

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f redis
```

### Estado de Servicios

```bash
# Ver estado actual
docker-compose ps

# Ver estadísticas de recursos
docker stats
```

## 🛠️ Solución de Problemas

### Puerto ya en uso

```bash
# Ver qué está usando el puerto
netstat -tulpn | grep :80
netstat -tulpn | grep :3000
netstat -tulpn | grep :6379

# Cambiar puertos en docker-compose.yml si es necesario
```

### Problemas de permisos (Linux/Mac)

```bash
sudo chown -R $USER:$USER .
```

### Limpiar todo y empezar de nuevo

```bash
# Detener todo y limpiar
docker-compose down -v --rmi all
docker system prune -f

# Volver a construir desde cero
docker-compose up -d --build
```

### Ver recursos de Docker

```bash
# Espacio usado por Docker
docker system df

# Ver todas las imágenes
docker images

# Ver todos los contenedores
docker ps -a
```

## 🔒 Seguridad

### Variables de Entorno Sensibles

- No commitear archivos `.env` con datos reales
- Usar archivos `.env.example` para plantillas
- En producción, usar secrets de Docker/Kubernetes

### Configuración de Red

- Los contenedores usan una red privada (`devops-news-network`)
- Solo los puertos necesarios están expuestos al host

## 📝 Notas Adicionales

- **Volúmenes persistentes**: Redis mantiene datos en `redis_data`
- **Dependencias**: Los servicios esperan dependencias con `depends_on`
- **Restart policy**: `unless-stopped` para auto-restart
- **Multi-stage build**: Frontend usa Node.js Bullseye para build y Nginx para serving
- **Proxy integrado**: Nginx del frontend hace proxy a `/api/*` → `http://api:3000/api/`
- **Red privada**: Todos los servicios en red `devops-news-network`
- **Seguridad**: API ejecuta con usuario no-root
- **Build optimizado**: Frontend compilado a archivos estáticos servidos por Nginx
