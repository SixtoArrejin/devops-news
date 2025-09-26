import express from "express";
import newsRoutes from "./news.js";
import votingRoutes from "./voting.js";
import rankingRoutes from "./ranking.js";
import adminRoutes from "./admin.js";

const router = express.Router();

// Rutas de noticias
router.use("/news", newsRoutes);

// Rutas de votación
router.use("/vote", votingRoutes);

// Rutas de ranking
router.use("/ranking", rankingRoutes);

// Rutas de administración
router.use("/admin", adminRoutes);

// Ruta de salud/estado de la API
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "DevOps News API está funcionando correctamente",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: {
      news: {
        "GET /api/news": "Obtener todas las noticias",
        "GET /api/news/:id": "Obtener noticia específica",
        "GET /api/news/category/:category": "Filtrar por categoría",
        "POST /api/news/refresh": "Actualizar cache manualmente",
      },
      voting: {
        "GET /api/vote/:id/:score": "Votar noticia (1-5)",
        "POST /api/vote": "Votar noticia (JSON)",
        "GET /api/vote/stats/:newsId": "Estadísticas de votación",
      },
      ranking: {
        "GET /api/ranking": "Ranking de noticias",
        "GET /api/ranking/top/:number": "Top N noticias",
        "GET /api/ranking/category/:category": "Ranking por categoría",
        "GET /api/ranking/stats": "Estadísticas generales",
      },
      admin: {
        "POST /api/admin/reset":
          "Resetear sistema (limpiar noticias y votos, recargar)",
        "POST /api/admin/flush-all": "⚠️ PELIGRO: Limpiar TODA la Redis",
        "POST /api/admin/clear-votes": "Limpiar solo votos (mantener noticias)",
        "GET /api/admin/redis-info": "Información de claves en Redis",
      },
    },
  });
});

// Ruta raíz de la API
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a DevOps News API",
    documentation: "/api/health",
    timestamp: new Date().toISOString(),
  });
});

export default router;
