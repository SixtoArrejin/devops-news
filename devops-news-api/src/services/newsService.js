import axios from "axios";
import { newsApiConfig } from "../config/index.js";
import { RedisService } from "../config/redis.js";
import { VotingService } from "./votingService.js";

export class NewsService {
  constructor() {
    this.apiKey = newsApiConfig.apiKey;
    this.baseUrl = newsApiConfig.baseUrl;
    this.cacheTtl = newsApiConfig.cacheTtl;
    this.votingService = new VotingService(this); // Inyectar referencia
  }

  /**
   * Obtiene noticias de DevOps desde NewsAPI
   * @returns {Promise<Array>} Array de noticias procesadas
   */
  async fetchDevOpsNews() {
    try {
      console.log("🔍 Obteniendo noticias de DevOps desde NewsAPI...");

      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: 'devops OR "continuous integration" OR "continuous deployment" OR kubernetes OR docker OR jenkins OR terraform',
          language: "en",
          sortBy: "publishedAt",
          pageSize: 20,
          apiKey: this.apiKey,
        },
        timeout: 10000, // 10 segundos timeout
      });

      if (response.data && response.data.articles) {
        const processedArticles = this.processArticles(response.data.articles);
        console.log(
          `✅ ${processedArticles.length} noticias obtenidas y procesadas`
        );
        return processedArticles;
      }

      return [];
    } catch (error) {
      console.error("❌ Error al obtener noticias de NewsAPI:", error.message);
      if (error.response) {
        console.error("📊 Status:", error.response.status);
        console.error("📄 Data:", error.response.data);
      }
      throw error;
    }
  }

  /**
   * Procesa los artículos de NewsAPI
   * @param {Array} articles - Artículos crudos de NewsAPI
   * @returns {Array} Artículos procesados
   */
  processArticles(articles) {
    return articles
      .filter(
        (article) =>
          article.title &&
          article.title !== "[Removed]" &&
          article.description &&
          article.url
      )
      .map((article, index) => ({
        id: this.generateArticleId(article, index),
        title: article.title.trim(),
        description: article.description ? article.description.trim() : "",
        url: article.url,
        source: article.source?.name || "Desconocido",
        author: article.author || "Desconocido",
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage,
        category: this.categorizeArticle(
          article.title + " " + article.description
        ),
        fetchedAt: new Date().toISOString(),
      }));
  }

  /**
   * Genera un ID único para el artículo
   * @param {Object} article - Artículo
   * @param {number} index - Índice del artículo
   * @returns {string} ID único
   */
  generateArticleId(article, index) {
    const timestamp = new Date(article.publishedAt).getTime();
    const hash = this.simpleHash(article.url);
    return `news_${timestamp}_${hash}_${index}`;
  }

  /**
   * Genera un hash simple para una cadena
   * @param {string} str - Cadena a hashear
   * @returns {string} Hash simple
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Categoriza el artículo basado en palabras clave
   * @param {string} text - Texto del título y descripción
   * @returns {string} Categoría del artículo
   */
  categorizeArticle(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("kubernetes") || lowerText.includes("k8s"))
      return "Kubernetes";
    if (lowerText.includes("docker") || lowerText.includes("container"))
      return "Containers";
    if (
      lowerText.includes("jenkins") ||
      lowerText.includes("ci/cd") ||
      lowerText.includes("pipeline")
    )
      return "CI/CD";
    if (lowerText.includes("terraform") || lowerText.includes("infrastructure"))
      return "Infrastructure";
    if (
      lowerText.includes("aws") ||
      lowerText.includes("azure") ||
      lowerText.includes("gcp")
    )
      return "Cloud";
    if (lowerText.includes("security") || lowerText.includes("vulnerability"))
      return "Security";
    if (lowerText.includes("monitoring") || lowerText.includes("observability"))
      return "Monitoring";

    return "General";
  }

  /**
   * Enriquece las noticias con información de votación
   * @param {Array} news - Array de noticias
   * @returns {Promise<Array>} Noticias enriquecidas con datos de votación
   */
  async enrichNewsWithVotes(news) {
    try {
      const enrichedNews = await Promise.all(
        news.map(async (article) => {
          try {
            const voteStats = await this.votingService.getNewsVoteStats(
              article.id
            );
            return {
              ...article,
              voteDetails: {
                averageScore: voteStats.averageScore || 0,
                voteCount: voteStats.voteCount || 0,
                totalScore: voteStats.totalScore || 0,
              },
            };
          } catch (error) {
            // Si no hay datos de votación, devolver con valores por defecto
            return {
              ...article,
              voteDetails: {
                averageScore: 0,
                voteCount: 0,
                totalScore: 0,
              },
            };
          }
        })
      );
      return enrichedNews;
    } catch (error) {
      console.error(
        "❌ Error al enriquecer noticias con votación:",
        error.message
      );
      return news; // Devolver noticias sin enriquecer si hay error
    }
  }

  /**
   * Obtiene noticias desde cache o API
   * @returns {Promise<Array>} Noticias enriquecidas con información de votación
   */
  async getNews() {
    try {
      // Intentar obtener desde cache
      const cachedNews = await RedisService.get("news:list");
      let news = [];

      if (cachedNews) {
        console.log("✅ Cache HIT - Noticias obtenidas desde Redis");
        news = JSON.parse(cachedNews);
      } else {
        console.log("❌ Cache MISS - Obteniendo noticias frescas");
        news = await this.refreshNewsCache();
      }

      // Enriquecer con información de votación
      return await this.enrichNewsWithVotes(news);
    } catch (error) {
      console.error("❌ Error al obtener noticias:", error.message);
      throw error;
    }
  }

  /**
   * Actualiza el cache de noticias
   * @returns {Promise<Array>} Noticias actualizadas
   */
  async refreshNewsCache() {
    try {
      const freshNews = await this.fetchDevOpsNews();

      if (freshNews.length > 0) {
        // Guardar en cache temporal con TTL
        await RedisService.set(
          "news:list",
          JSON.stringify(freshNews),
          this.cacheTtl
        );

        // También guardar timestamp de última actualización
        await RedisService.set(
          "news:last_update",
          new Date().toISOString(),
          this.cacheTtl
        );

        console.log("🔄 Cache de noticias actualizado en Redis");
      }

      return freshNews;
    } catch (error) {
      console.error("❌ Error al actualizar cache de noticias:", error.message);

      // En caso de error, intentar devolver datos en cache aunque hayan expirado
      const staleCache = await RedisService.get("news:list");
      if (staleCache) {
        console.log(
          "⚠️ Devolviendo datos en cache obsoletos debido a error en API"
        );
        return JSON.parse(staleCache);
      }

      throw error;
    }
  }

  /**
   * Obtiene información de última actualización
   * @returns {Promise<Object>} Información de cache
   */
  async getCacheInfo() {
    try {
      const lastUpdate = await RedisService.get("news:last_update");
      const newsCount = await RedisService.get("news:list");

      return {
        lastUpdate: lastUpdate || null,
        newsCount: newsCount ? JSON.parse(newsCount).length : 0,
        cacheTtl: this.cacheTtl,
      };
    } catch (error) {
      console.error("❌ Error al obtener información de cache:", error.message);
      return {
        lastUpdate: null,
        newsCount: 0,
        cacheTtl: this.cacheTtl,
      };
    }
  }

  /**
   * Guarda una noticia específica de forma permanente (solo cuando es votada)
   * @param {Object} article - Noticia a guardar
   */
  async saveIndividualNews(article) {
    try {
      const newsKey = `news:individual:${article.id}`;
      // Guardar sin TTL para que sea permanente
      await RedisService.set(newsKey, JSON.stringify(article));
      console.log(
        `📰 Noticia ${article.id} guardada permanentemente para ranking`
      );
    } catch (error) {
      console.error(
        `❌ Error al guardar noticia individual ${article.id}:`,
        error.message
      );
    }
  }

  /**
   * Obtiene una noticia específica por ID desde el almacenamiento permanente
   * @param {string} newsId - ID de la noticia
   * @returns {Promise<Object|null>} Datos de la noticia o null si no existe
   */
  async getIndividualNews(newsId) {
    try {
      const newsKey = `news:individual:${newsId}`;
      const newsData = await RedisService.get(newsKey);
      return newsData ? JSON.parse(newsData) : null;
    } catch (error) {
      console.error(`❌ Error al obtener noticia ${newsId}:`, error.message);
      return null;
    }
  }
}
