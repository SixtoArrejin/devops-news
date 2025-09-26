import express from "express";
import { VotingService } from "../services/votingService.js";

const router = express.Router();
const votingService = new VotingService();

/**
 * GET /vote/:id/:score
 * Registra un voto para una noticia específica
 */
router.get("/:id/:score", async (req, res) => {
  try {
    const { id, score } = req.params;

    // Obtener IP del usuario para identificación básica
    const userIp = req.ip || req.connection.remoteAddress || "unknown";
    const userId = `user_${userIp.replace(/:/g, "_")}`;

    const result = await votingService.voteNews(id, score, userId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("❌ Error en /vote/:id/:score:", error.message);

    let statusCode = 500;
    if (error.message.includes("puntuación debe estar")) {
      statusCode = 400;
    } else if (error.message.includes("no encontrada")) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      error: "Error al registrar voto",
      message: error.message,
    });
  }
});

/**
 * POST /vote
 * Registra un voto usando método POST (más RESTful)
 */
router.post("/", async (req, res) => {
  try {
    const { newsId, score, userId } = req.body;

    if (!newsId || !score) {
      return res.status(400).json({
        success: false,
        error: "Parámetros requeridos faltantes",
        message: "Se requieren newsId y score",
      });
    }

    // Si no se proporciona userId, usar IP
    const finalUserId =
      userId || `user_${(req.ip || "unknown").replace(/:/g, "_")}`;

    const result = await votingService.voteNews(newsId, score, finalUserId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("❌ Error en POST /vote:", error.message);

    let statusCode = 500;
    if (error.message.includes("puntuación debe estar")) {
      statusCode = 400;
    } else if (error.message.includes("no encontrada")) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      error: "Error al registrar voto",
      message: error.message,
    });
  }
});

/**
 * GET /vote/stats/:newsId
 * Obtiene estadísticas de votos para una noticia específica
 */
router.get("/stats/:newsId", async (req, res) => {
  try {
    const { newsId } = req.params;
    const stats = await votingService.getNewsVoteStats(newsId);
    const newsDetails = await votingService.getNewsDetails(newsId);

    if (!newsDetails) {
      return res.status(404).json({
        success: false,
        error: "Noticia no encontrada",
        message: `No se encontró una noticia con ID: ${newsId}`,
      });
    }

    res.json({
      success: true,
      newsId,
      newsDetails,
      stats,
    });
  } catch (error) {
    console.error("❌ Error en /vote/stats/:newsId:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener estadísticas de votos",
      message: error.message,
    });
  }
});

export default router;
