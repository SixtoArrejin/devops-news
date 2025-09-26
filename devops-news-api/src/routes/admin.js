import express from "express";
import { NewsService } from "../services/newsService.js";
import { getRedisClient } from "../config/redis.js";

const router = express.Router();
const newsService = new NewsService();

/**
 * POST /admin/reset
 * Limpia completamente Redis y recarga las noticias
 */
router.post("/reset", async (req, res) => {
  try {
    console.log("🧹 Iniciando reset completo del sistema...");

    const client = getRedisClient();

    // Limpiar todas las claves relacionadas con noticias y votos
    const newsKeys = await client.keys("news:*");

    if (newsKeys.length > 0) {
      await client.del(...newsKeys);
      console.log(`🗑️ ${newsKeys.length} claves de noticias eliminadas`);
    }

    // Recargar noticias frescas
    console.log("🔄 Recargando noticias frescas...");
    const freshNews = await newsService.refreshNewsCache();

    res.json({
      success: true,
      message: "Sistema reseteado completamente",
      actions: {
        keysDeleted: newsKeys.length,
        newsReloaded: freshNews.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en reset del sistema:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al resetear el sistema",
      message: error.message,
    });
  }
});

/**
 * POST /admin/flush-all
 * Limpia COMPLETAMENTE Redis (CUIDADO: borra todo)
 */
router.post("/flush-all", async (req, res) => {
  try {
    console.log("⚠️ ADVERTENCIA: Limpiando TODA la base de datos Redis...");

    const client = getRedisClient();
    await client.flushall();

    // Recargar noticias después de limpiar todo
    console.log("🔄 Recargando noticias después de flush completo...");
    const freshNews = await newsService.refreshNewsCache();

    res.json({
      success: true,
      message:
        "Toda la base de datos Redis ha sido limpiada y las noticias recargadas",
      actions: {
        operation: "FLUSHALL executed",
        newsReloaded: freshNews.length,
      },
      warning: "Todos los datos anteriores han sido eliminados permanentemente",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en flush-all:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al ejecutar flush-all",
      message: error.message,
    });
  }
});

/**
 * GET /admin/redis-info
 * Obtiene información sobre las claves en Redis
 */
router.get("/redis-info", async (req, res) => {
  try {
    const client = getRedisClient();

    const newsKeys = await client.keys("news:*");
    const voteKeys = await client.keys("news:vote*");
    const allKeys = await client.keys("*");

    // Obtener información específica
    const newsListExists = await client.exists("news:list");
    const newsListTtl = newsListExists ? await client.ttl("news:list") : null;

    res.json({
      success: true,
      redis: {
        totalKeys: allKeys.length,
        newsKeys: newsKeys.length,
        voteKeys: voteKeys.length,
        newsCache: {
          exists: !!newsListExists,
          ttl: newsListTtl,
          ttlFormatted:
            newsListTtl > 0 ? `${Math.floor(newsListTtl / 60)} minutos` : null,
        },
      },
      keysByType: {
        news: newsKeys,
        votes: voteKeys,
        all: allKeys,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error obteniendo info de Redis:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener información de Redis",
      message: error.message,
    });
  }
});

/**
 * POST /admin/clear-votes
 * Limpia solo los datos de votación, mantiene las noticias
 */
router.post("/clear-votes", async (req, res) => {
  try {
    console.log("🗳️ Limpiando solo datos de votación...");

    const client = getRedisClient();
    const voteKeys = await client.keys("news:vote*");

    if (voteKeys.length > 0) {
      await client.del(...voteKeys);
      console.log(`🗑️ ${voteKeys.length} claves de votación eliminadas`);
    }

    res.json({
      success: true,
      message: "Datos de votación limpiados (noticias mantenidas)",
      actions: {
        voteKeysDeleted: voteKeys.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error limpiando votos:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al limpiar votos",
      message: error.message,
    });
  }
});

export default router;
