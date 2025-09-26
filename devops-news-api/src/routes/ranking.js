import express from "express";
import { VotingService } from "../services/votingService.js";

const router = express.Router();
const votingService = new VotingService();

/**
 * GET /ranking
 * Obtiene el ranking de noticias más votadas
 */
router.get("/", async (req, res) => {
  try {
    // Obtener parámetro de límite desde query string (por defecto 10)
    const limit = parseInt(req.query.limit) || 10;

    // Validar límite
    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        error: "Límite inválido",
        message: "El límite debe estar entre 1 y 50",
      });
    }

    const ranking = await votingService.getNewsRanking(limit);

    res.json({
      success: true,
      data: ranking,
      count: ranking.length,
      limit: limit,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en /ranking:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener ranking",
      message: error.message,
    });
  }
});

/**
 * GET /ranking/top/:number
 * Obtiene el top N de noticias más votadas
 */
router.get("/top/:number", async (req, res) => {
  try {
    const number = parseInt(req.params.number);

    if (isNaN(number) || number < 1 || number > 50) {
      return res.status(400).json({
        success: false,
        error: "Número inválido",
        message: "El número debe estar entre 1 y 50",
      });
    }

    const ranking = await votingService.getNewsRanking(number);

    res.json({
      success: true,
      data: ranking,
      count: ranking.length,
      topNumber: number,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en /ranking/top/:number:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener top ranking",
      message: error.message,
    });
  }
});

/**
 * GET /ranking/stats
 * Obtiene estadísticas generales de votación
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await votingService.getGeneralStats();

    res.json({
      success: true,
      stats: {
        ...stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error en /ranking/stats:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener estadísticas de ranking",
      message: error.message,
    });
  }
});

/**
 * GET /ranking/category/:category
 * Obtiene ranking filtrado por categoría
 */
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Obtener ranking completo y filtrar por categoría
    const fullRanking = await votingService.getNewsRanking(50); // Obtener más para filtrar
    const filteredRanking = fullRanking
      .filter(
        (item) =>
          item.newsDetails &&
          item.newsDetails.category.toLowerCase() === category.toLowerCase()
      )
      .slice(0, limit); // Limitar después del filtrado

    // Reajustar posiciones después del filtrado
    filteredRanking.forEach((item, index) => {
      item.position = index + 1;
    });

    res.json({
      success: true,
      data: filteredRanking,
      count: filteredRanking.length,
      category: category,
      limit: limit,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en /ranking/category/:category:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener ranking por categoría",
      message: error.message,
    });
  }
});

export default router;
