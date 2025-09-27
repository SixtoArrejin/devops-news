import { config } from "dotenv";

// Cargar variables de entorno
config();

export const serverConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
};

export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined, // undefined para Redis sin auth
  username: process.env.REDIS_USERNAME || undefined,
  retryDelayOnFailover: 100,
  retryTimes: 3,
  maxRetriesPerRequest: 3,
};

export const newsApiConfig = {
  apiKey: process.env.NEWS_API_KEY,
  baseUrl: process.env.NEWS_API_URL || "https://newsapi.org/v2",
  cacheTtl: parseInt(process.env.CACHE_TTL) || 7200, // 2 horas en segundos
  refreshInterval: parseInt(process.env.NEWS_REFRESH_INTERVAL) || 2, // valor numérico
  refreshUnit: process.env.NEWS_REFRESH_UNIT || "hours", // unidad: minutes o hours
};

// Validar que las variables críticas estén definidas
const requiredEnvVars = ["REDIS_HOST", "NEWS_API_KEY"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno requerida no encontrada: ${envVar}`);
  }
}

// REDIS_PASSWORD es opcional para Redis local sin auth
