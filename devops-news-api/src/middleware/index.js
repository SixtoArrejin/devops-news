/**
 * Middleware para logging de requests
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  console.log(
    `📥 [${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`
  );

  // Capturar cuando termina la respuesta
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? "❌" : "✅";
    console.log(
      `📤 [${timestamp}] ${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

/**
 * Middleware para manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error no manejado:", err.message);
  console.error("Stack trace:", err.stack);

  // Error de Redis
  if (err.message.includes("Redis") || err.message.includes("ECONNREFUSED")) {
    return res.status(503).json({
      success: false,
      error: "Servicio temporalmente no disponible",
      message: "Error de conexión con la base de datos en caché",
    });
  }

  // Error de API externa
  if (
    err.message.includes("NewsAPI") ||
    err.response?.config?.url?.includes("newsapi.org")
  ) {
    return res.status(502).json({
      success: false,
      error: "Error del servicio externo",
      message: "Error al obtener noticias del proveedor externo",
    });
  }

  // Error de validación
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Error de validación",
      message: err.message,
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Ha ocurrido un error inesperado",
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    availableEndpoints: "/api/health",
  });
};

/**
 * Middleware para CORS personalizado
 */
export const corsHandler = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
};

/**
 * Middleware para limitar rate limiting básico
 */
export const basicRateLimit = (() => {
  const requestCounts = new Map();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
  const MAX_REQUESTS = 100; // Máximo 100 requests por ventana

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
      return next();
    }

    const requestData = requestCounts.get(ip);

    if (now > requestData.resetTime) {
      requestData.count = 1;
      requestData.resetTime = now + WINDOW_MS;
      return next();
    }

    if (requestData.count >= MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        error: "Demasiadas solicitudes",
        message:
          "Has excedido el límite de solicitudes. Intenta nuevamente más tarde.",
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
      });
    }

    requestData.count++;
    next();
  };
})();

/**
 * Middleware para validar parámetros de votación
 */
export const validateVoteParams = (req, res, next) => {
  const score = req.params.score || req.body.score;
  const newsId = req.params.id || req.body.newsId;

  if (!newsId) {
    return res.status(400).json({
      success: false,
      error: "ID de noticia requerido",
      message: "Debe proporcionar un ID de noticia válido",
    });
  }

  if (!score) {
    return res.status(400).json({
      success: false,
      error: "Puntuación requerida",
      message: "Debe proporcionar una puntuación entre 1 y 5",
    });
  }

  const numericScore = parseInt(score);
  if (isNaN(numericScore) || numericScore < 1 || numericScore > 5) {
    return res.status(400).json({
      success: false,
      error: "Puntuación inválida",
      message: "La puntuación debe ser un número entre 1 y 5",
    });
  }

  // Agregar score validado al request
  req.validatedScore = numericScore;
  next();
};

/**
 * Middleware para agregar headers de seguridad básicos
 */
export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.removeHeader("X-Powered-By");
  next();
};
