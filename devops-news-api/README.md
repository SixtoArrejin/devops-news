# DevOps News API

API Backend para agregación y votación de noticias de DevOps. Utiliza **NewsAPI** para obtener noticias actualizadas y **Redis Cloud** para caché y almacenamiento de votaciones.

## 🚀 Características

- **Agregación automática de noticias** de DevOps usando NewsAPI
- **Sistema de votación** con puntuaciones de 1 a 5 estrellas
- **Ranking de noticias** más votadas
- **Caché inteligente** con Redis para optimizar rendimiento
- **Actualización automática** programada cada 2 horas
- **API RESTful** bien estructurada y documentada
- **Categorización automática** de noticias por temas
- **Rate limiting** y middlewares de seguridad

## 🏗️ Arquitectura

```
devops-news-api/
├── src/
│   ├── config/         # Configuraciones y conexiones
│   │   ├── index.js    # Variables de entorno
│   │   └── redis.js    # Cliente Redis
│   ├── services/       # Lógica de negocio
│   │   ├── newsService.js    # Servicio de noticias
│   │   ├── votingService.js  # Servicio de votación
│   │   └── cronService.js    # Tareas programadas
│   ├── routes/         # Endpoints de la API
│   │   ├── news.js     # Rutas de noticias
│   │   ├── voting.js   # Rutas de votación
│   │   ├── ranking.js  # Rutas de ranking
│   │   └── index.js    # Router principal
│   ├── middleware/     # Middlewares de Express
│   │   └── index.js    # Logging, errores, CORS, etc.
│   ├── utils/          # Utilidades helper
│   │   └── index.js    # Funciones de utilidad
│   └── server.js       # Servidor principal
├── .env                # Variables de entorno
├── .env.example        # Ejemplo de variables
└── package.json        # Dependencias y scripts
```

## 📋 Requisitos

- **Node.js** >= 18.x
- **Redis** (usando Redis Cloud)
- **NewsAPI Key** (gratuita en [newsapi.org](https://newsapi.org))

## ⚙️ Instalación

1. **Clonar y navegar al directorio:**

   ```bash
   cd devops-news-api
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**

   ```bash
   cp .env.example .env
   ```

   Editar `.env` con tus credenciales:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Redis Configuration (Redis Cloud)
   REDIS_HOST=redis-17428.c56.east-us.azure.redns.redis-cloud.com
   REDIS_PORT=17428
   REDIS_PASSWORD=tu-password-redis
   REDIS_USERNAME=default

   # NewsAPI Configuration
   NEWS_API_KEY=tu-newsapi-key
   NEWS_API_URL=https://newsapi.org/v2

   # Cache Configuration
   CACHE_TTL=7200
   NEWS_REFRESH_INTERVAL=2
   ```

4. **Iniciar el servidor:**

   ```bash
   # Desarrollo (con hot-reload)
   npm run dev

   # Producción
   npm start
   ```

## 📚 Endpoints de la API

### 🏠 Información General

- **`GET /`** - Página de bienvenida
- **`GET /status`** - Estado del servidor y trabajos cron
- **`GET /api/health`** - Documentación completa de endpoints

### 📰 Noticias

- **`GET /api/news`** - Obtener todas las noticias
- **`GET /api/news/:id`** - Obtener noticia específica
- **`GET /api/news/category/:category`** - Filtrar por categoría
- **`POST /api/news/refresh`** - Forzar actualización de cache

### 🗳️ Votación

- **`GET /api/vote/:id/:score`** - Votar noticia (score: 1-5)
- **`POST /api/vote`** - Votar usando JSON
- **`GET /api/vote/stats/:newsId`** - Estadísticas de votación

### 🏆 Ranking

- **`GET /api/ranking`** - Ranking de noticias más votadas
- **`GET /api/ranking/top/:number`** - Top N noticias
- **`GET /api/ranking/category/:category`** - Ranking por categoría
- **`GET /api/ranking/stats`** - Estadísticas generales

## 🔧 Ejemplos de Uso

### Obtener noticias

```bash
curl http://localhost:3000/api/news
```

### Votar una noticia

```bash
curl http://localhost:3000/api/vote/news_123456/5
```

### Ver ranking

```bash
curl http://localhost:3000/api/ranking
```

### Votar usando POST

```bash
curl -X POST http://localhost:3000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"newsId": "news_123456", "score": 4}'
```

## 🔄 Tareas Automáticas

El sistema ejecuta las siguientes tareas programadas:

- **Actualización de noticias**: Cada 2 horas (configurable)
- **Limpieza de datos**: Diariamente a las 3:00 AM
- **Estadísticas**: Cada 6 horas

## 🗂️ Categorías de Noticias

Las noticias se categorizan automáticamente:

- **Kubernetes** - Orquestación de contenedores
- **Containers** - Docker y contenedorización
- **CI/CD** - Integración y despliegue continuo
- **Infrastructure** - Terraform e infraestructura
- **Cloud** - AWS, Azure, GCP
- **Security** - Seguridad y vulnerabilidades
- **Monitoring** - Observabilidad y monitoreo
- **General** - Otros temas de DevOps

## 🛠️ Desarrollo

### Scripts disponibles:

```bash
npm start      # Iniciar en producción
npm run dev    # Desarrollo con hot-reload
npm test       # Ejecutar tests (por implementar)
```

### Estructura de datos:

#### Noticia:

```json
{
  "id": "news_1640995200000_abc123_0",
  "title": "Kubernetes 1.25 Released",
  "description": "Nueva versión con mejoras...",
  "url": "https://...",
  "source": "Kubernetes Blog",
  "author": "CNCF",
  "publishedAt": "2024-01-01T12:00:00Z",
  "category": "Kubernetes",
  "fetchedAt": "2024-01-01T12:05:00Z"
}
```

#### Voto:

```json
{
  "newsId": "news_123456",
  "score": 5,
  "userId": "user_192.168.1.1",
  "timestamp": "2024-01-01T12:30:00Z"
}
```

## 🚨 Manejo de Errores

La API maneja diferentes tipos de errores:

- **400** - Parámetros inválidos
- **404** - Recurso no encontrado
- **429** - Demasiadas solicitudes (rate limit)
- **500** - Error interno del servidor
- **502** - Error del servicio externo (NewsAPI)
- **503** - Servicio no disponible (Redis)

## 🔒 Seguridad

Implementaciones de seguridad incluidas:

- Rate limiting básico (100 requests/15min)
- Headers de seguridad HTTP
- Sanitización de entrada
- Validación de parámetros
- Manejo seguro de errores
- CORS configurado

## 📊 Monitoreo

### Logs disponibles:

- Requests HTTP con tiempo de respuesta
- Conexiones/errores de Redis
- Actualizaciones de noticias
- Errores del sistema

### Métricas del sistema:

```bash
curl http://localhost:3000/status
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

ISC License - Ver archivo LICENSE para más detalles.

## 🆘 Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.

---

**Desarrollado con ❤️ usando Node.js, Express, Redis y NewsAPI**
