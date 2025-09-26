/**
 * Utilidades para formateo de fecha y tiempo
 */
export class DateUtils {
  /**
   * Formatea una fecha a string legible
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  static formatDate(date) {
    const d = new Date(date);
    return d.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Calcula el tiempo relativo desde una fecha
   * @param {Date|string} date - Fecha base
   * @returns {string} Tiempo relativo (ej: "hace 2 horas")
   */
  static timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    return "hace un momento";
  }
}

/**
 * Utilidades para validación de datos
 */
export class ValidationUtils {
  /**
   * Valida si una URL es válida
   * @param {string} url - URL a validar
   * @returns {boolean} True si es válida
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida puntuación de votación
   * @param {any} score - Puntuación a validar
   * @returns {Object} Resultado de validación
   */
  static validateScore(score) {
    const numericScore = parseInt(score);

    if (isNaN(numericScore)) {
      return { valid: false, message: "La puntuación debe ser un número" };
    }

    if (numericScore < 1 || numericScore > 5) {
      return { valid: false, message: "La puntuación debe estar entre 1 y 5" };
    }

    return { valid: true, score: numericScore };
  }

  /**
   * Sanitiza texto para evitar XSS básico
   * @param {string} text - Texto a sanitizar
   * @returns {string} Texto sanitizado
   */
  static sanitizeText(text) {
    if (typeof text !== "string") return "";

    return text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }
}

/**
 * Utilidades para manejo de errores
 */
export class ErrorUtils {
  /**
   * Crea un error personalizado con código
   * @param {string} message - Mensaje del error
   * @param {number} code - Código de error HTTP
   * @param {string} type - Tipo de error
   * @returns {Error} Error personalizado
   */
  static createError(message, code = 500, type = "INTERNAL_ERROR") {
    const error = new Error(message);
    error.statusCode = code;
    error.type = type;
    return error;
  }

  /**
   * Determina si un error es de Redis
   * @param {Error} error - Error a evaluar
   * @returns {boolean} True si es error de Redis
   */
  static isRedisError(error) {
    return (
      error.message.includes("Redis") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("connection")
    );
  }

  /**
   * Determina si un error es de API externa
   * @param {Error} error - Error a evaluar
   * @returns {boolean} True si es error de API externa
   */
  static isExternalApiError(error) {
    return error.response && error.response.status >= 400;
  }
}

/**
 * Utilidades para cache
 */
export class CacheUtils {
  /**
   * Genera clave de cache estandarizada
   * @param {string} prefix - Prefijo de la clave
   * @param {string} identifier - Identificador único
   * @returns {string} Clave de cache
   */
  static generateCacheKey(prefix, identifier) {
    return `${prefix}:${identifier}`;
  }

  /**
   * Calcula TTL basado en el tipo de datos
   * @param {string} dataType - Tipo de datos
   * @returns {number} TTL en segundos
   */
  static calculateTTL(dataType) {
    const ttlMap = {
      news: 7200, // 2 horas
      votes: 86400, // 24 horas
      stats: 3600, // 1 hora
      user: 1800, // 30 minutos
    };

    return ttlMap[dataType] || 3600; // Default: 1 hora
  }
}

/**
 * Utilidades para logging
 */
export class LogUtils {
  /**
   * Log con timestamp y emoji
   * @param {string} level - Nivel de log
   * @param {string} message - Mensaje
   * @param {Object} data - Datos adicionales
   */
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      debug: "🐛",
    };

    console.log(`${emoji[level] || "📝"} [${timestamp}] ${message}`);

    if (data) {
      console.log("Data:", JSON.stringify(data, null, 2));
    }
  }

  static info(message, data) {
    this.log("info", message, data);
  }
  static success(message, data) {
    this.log("success", message, data);
  }
  static warning(message, data) {
    this.log("warning", message, data);
  }
  static error(message, data) {
    this.log("error", message, data);
  }
  static debug(message, data) {
    this.log("debug", message, data);
  }
}
