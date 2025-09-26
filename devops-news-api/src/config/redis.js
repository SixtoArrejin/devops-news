import Redis from "ioredis";
import { redisConfig } from "./index.js";

let redisClient = null;

export const connectRedis = () => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      username: redisConfig.username,
      retryDelayOnFailover: redisConfig.retryDelayOnFailover,
      retryTimes: redisConfig.retryTimes,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      lazyConnect: true,
    });

    redisClient.on("connect", () => {
      console.log("✅ Conectado a Redis Cloud");
    });

    redisClient.on("error", (error) => {
      console.error("❌ Error de conexión Redis:", error.message);
    });

    redisClient.on("close", () => {
      console.log("⚠️ Conexión Redis cerrada");
    });

    return redisClient;
  } catch (error) {
    console.error("❌ Error al crear cliente Redis:", error.message);
    throw error;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error(
      "Redis client no inicializado. Llama a connectRedis() primero."
    );
  }
  return redisClient;
};

export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
    console.log("🔌 Conexión Redis cerrada");
  }
};

// Funciones de utilidad para el cache
export class RedisService {
  static async get(key) {
    const client = getRedisClient();
    return await client.get(key);
  }

  static async set(key, value, ttl = null) {
    const client = getRedisClient();
    if (ttl) {
      return await client.set(key, value, "EX", ttl);
    }
    return await client.set(key, value);
  }

  static async del(key) {
    const client = getRedisClient();
    return await client.del(key);
  }

  // Para manejar sorted sets (rankings)
  static async zincrby(key, score, member) {
    const client = getRedisClient();
    return await client.zincrby(key, score, member);
  }

  static async zrevrange(key, start, stop, withScores = false) {
    const client = getRedisClient();
    if (withScores) {
      return await client.zrevrange(key, start, stop, "WITHSCORES");
    }
    return await client.zrevrange(key, start, stop);
  }

  static async zscore(key, member) {
    const client = getRedisClient();
    return await client.zscore(key, member);
  }
}
