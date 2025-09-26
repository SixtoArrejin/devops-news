import express from "express";
import { NewsService } from "../services/newsService.js";

const router = express.Router();
const newsService = new NewsService();

/**
 * GET /news
 * Obtiene todas las noticias de DevOps
 */
router.get("/", async (req, res) => {
  try {
    const news = await newsService.getNews();

    // Información adicional sobre el cache
    const cacheInfo = await newsService.getCacheInfo();

    res.json({
      success: true,
      data: news,
      count: news.length,
      cache: cacheInfo,
    });
  } catch (error) {
    console.error("❌ Error en /news:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener noticias",
      message: error.message,
    });
  }
});

/**
 * POST /news/refresh
 * Fuerza la actualización del cache de noticias
 */
router.post("/refresh", async (req, res) => {
  try {
    console.log("🔄 Actualización manual de noticias solicitada");
    const freshNews = await newsService.refreshNewsCache();

    res.json({
      success: true,
      message: "Cache de noticias actualizado manualmente",
      data: freshNews,
      count: freshNews.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en /news/refresh:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al actualizar cache de noticias",
      message: error.message,
    });
  }
});

/**
 * GET /news/:id
 * Obtiene una noticia específica por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const news = await newsService.getNews();
    const specificNews = news.find((item) => item.id === id);

    if (!specificNews) {
      return res.status(404).json({
        success: false,
        error: "Noticia no encontrada",
        message: `No se encontró una noticia con ID: ${id}`,
      });
    }

    res.json({
      success: true,
      data: specificNews,
    });
  } catch (error) {
    console.error("❌ Error en /news/:id:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener noticia específica",
      message: error.message,
    });
  }
});

/**
 * GET /news/category/:category
 * Obtiene noticias filtradas por categoría
 */
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const news = await newsService.getNews();
    const filteredNews = news.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );

    res.json({
      success: true,
      data: filteredNews,
      count: filteredNews.length,
      category: category,
    });
  } catch (error) {
    console.error("❌ Error en /news/category/:category:", error.message);
    res.status(500).json({
      success: false,
      error: "Error al filtrar noticias por categoría",
      message: error.message,
    });
  }
});

export default router;
