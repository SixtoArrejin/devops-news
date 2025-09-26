import { RedisService, getRedisClient } from "../config/redis.js";

export class VotingService {
  constructor(newsService = null) {
    this.votesKey = "news:votes";
    this.votesDetailKey = "news:votes:detail";
    this.newsService = newsService;
  }

  /**
   * Registra un voto para una noticia
   * @param {string} newsId - ID de la noticia
   * @param {number} score - Puntuación (1-5)
   * @param {string} userId - ID del usuario (opcional, por ahora usaremos IP o algo similar)
   * @returns {Promise<Object>} Resultado del voto
   */
  async voteNews(newsId, score, userId = "anonymous") {
    try {
      // Validar puntuación
      const numericScore = parseInt(score);
      if (numericScore < 1 || numericScore > 5) {
        throw new Error("La puntuación debe estar entre 1 y 5");
      }

      // Verificar si la noticia existe
      const newsExists = await this.checkNewsExists(newsId);
      if (!newsExists) {
        throw new Error("Noticia no encontrada");
      }

      // Registrar voto en sorted set (para ranking)
      await RedisService.zincrby(this.votesKey, numericScore, newsId);

      // Incrementar contador de votos (IMPORTANTE para calcular average)
      await this.incrementVoteCount(newsId);

      // Guardar detalle del voto (para estadísticas)
      const voteDetail = {
        newsId,
        score: numericScore,
        userId,
        timestamp: new Date().toISOString(),
      };

      const voteKey = `${
        this.votesDetailKey
      }:${newsId}:${userId}:${Date.now()}`;
      await RedisService.set(voteKey, JSON.stringify(voteDetail), 86400); // 24 horas

      // Obtener estadísticas actualizadas
      const stats = await this.getNewsVoteStats(newsId);

      console.log(`✅ Voto registrado: ${newsId} - ${numericScore} estrellas`);

      return {
        success: true,
        message: `Voto de ${numericScore} estrellas registrado para la noticia ${newsId}`,
        newsId,
        score: numericScore,
        stats,
      };
    } catch (error) {
      console.error("❌ Error al registrar voto:", error.message);
      throw error;
    }
  }

  /**
   * Verifica si una noticia existe en el cache
   * @param {string} newsId - ID de la noticia
   * @returns {Promise<boolean>} True si existe
   */
  async checkNewsExists(newsId) {
    try {
      // Primero verificar en almacenamiento permanente
      const newsKey = `news:individual:${newsId}`;
      const permanentNews = await RedisService.get(newsKey);
      if (permanentNews) {
        return true;
      }

      // Si no está en permanente, verificar en cache temporal
      const newsListStr = await RedisService.get("news:list");
      if (newsListStr) {
        const newsList = JSON.parse(newsListStr);
        const exists = newsList.some((news) => news.id === newsId);

        // Si existe en temporal, guardarla en permanente (solo cuando se va a votar)
        if (exists) {
          const newsItem = newsList.find((news) => news.id === newsId);
          if (this.newsService) {
            await this.newsService.saveIndividualNews(newsItem);
          } else {
            // Fallback si no hay newsService inyectado
            await RedisService.set(newsKey, JSON.stringify(newsItem));
          }
          console.log(
            `💾 Noticia ${newsId} guardada permanentemente (primera votación)`
          );
        }

        return exists;
      }

      return false;
    } catch (error) {
      console.error(
        "❌ Error al verificar existencia de noticia:",
        error.message
      );
      return false;
    }
  }

  /**
   * Obtiene el ranking de noticias más votadas
   * @param {number} limit - Número máximo de noticias a devolver
   * @returns {Promise<Array>} Ranking de noticias
   */
  async getNewsRanking(limit = 10) {
    try {
      // Obtener ranking desde Redis sorted set
      const rankingData = await RedisService.zrevrange(
        this.votesKey,
        0,
        limit - 1,
        true // WITHSCORES
      );

      // Procesar datos del ranking
      const ranking = [];
      for (let i = 0; i < rankingData.length; i += 2) {
        const newsId = rankingData[i];
        const totalScore = parseFloat(rankingData[i + 1]);

        // Obtener detalles de la noticia
        const newsDetails = await this.getNewsDetails(newsId);
        const stats = await this.getNewsVoteStats(newsId);

        ranking.push({
          position: Math.floor(i / 2) + 1,
          newsId,
          totalScore: totalScore,
          averageScore: stats.averageScore,
          voteCount: stats.voteCount,
          newsDetails,
        });
      }

      console.log(`📊 Ranking generado con ${ranking.length} noticias`);
      return ranking;
    } catch (error) {
      console.error("❌ Error al obtener ranking:", error.message);
      throw error;
    }
  }

  /**
   * Obtiene detalles de una noticia específica
   * @param {string} newsId - ID de la noticia
   * @returns {Promise<Object|null>} Detalles de la noticia
   */
  async getNewsDetails(newsId) {
    try {
      // Primero intentar buscar en el almacenamiento permanente
      const newsKey = `news:individual:${newsId}`;
      const newsData = await RedisService.get(newsKey);

      if (newsData) {
        return JSON.parse(newsData);
      }

      // Si no está en el almacenamiento permanente, buscar en cache temporal (para noticias muy nuevas)
      const newsListStr = await RedisService.get("news:list");
      if (newsListStr) {
        const newsList = JSON.parse(newsListStr);
        const news = newsList.find((item) => item.id === newsId);

        if (news) {
          // Si la encontramos, guardarla también en almacenamiento permanente
          await RedisService.set(newsKey, JSON.stringify(news));
          return news;
        }
      }

      return null;
    } catch (error) {
      console.error("❌ Error al obtener detalles de noticia:", error.message);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de votos para una noticia específica
   * @param {string} newsId - ID de la noticia
   * @returns {Promise<Object>} Estadísticas de votos
   */
  async getNewsVoteStats(newsId) {
    try {
      // Obtener puntuación total desde sorted set
      const totalScore = await RedisService.zscore(this.votesKey, newsId);

      if (!totalScore) {
        return {
          totalScore: 0,
          voteCount: 0,
          averageScore: 0,
        };
      }

      // Para obtener el número de votos, necesitaríamos llevar un contador separado
      // Por simplicidad, usaremos una aproximación basada en la puntuación total
      // En una implementación real, mantendríamos contadores separados
      const voteCount = await this.getVoteCount(newsId);
      const averageScore = voteCount > 0 ? totalScore / voteCount : 0;

      return {
        totalScore: parseFloat(totalScore),
        voteCount,
        averageScore: Math.round(averageScore * 100) / 100, // Redondear a 2 decimales
      };
    } catch (error) {
      console.error(
        "❌ Error al obtener estadísticas de votos:",
        error.message
      );
      return {
        totalScore: 0,
        voteCount: 0,
        averageScore: 0,
      };
    }
  }

  /**
   * Obtiene el número de votos para una noticia (implementación simplificada)
   * @param {string} newsId - ID de la noticia
   * @returns {Promise<number>} Número de votos
   */
  async getVoteCount(newsId) {
    try {
      // Mantener un contador de votos por noticia
      const countKey = `news:vote_count:${newsId}`;
      const count = await RedisService.get(countKey);
      console.log(
        `🔍 Debug - getVoteCount para ${newsId}: key=${countKey}, rawValue=${count}, parsed=${
          parseInt(count) || 0
        }`
      );
      return count ? parseInt(count) : 0;
    } catch (error) {
      console.error("❌ Error al obtener contador de votos:", error.message);
      return 0;
    }
  }

  /**
   * Incrementa el contador de votos para una noticia
   * @param {string} newsId - ID de la noticia
   * @returns {Promise<void>}
   */
  async incrementVoteCount(newsId) {
    try {
      const countKey = `news:vote_count:${newsId}`;
      const client = getRedisClient();
      const newCount = await client.incr(countKey);
      console.log(
        `📊 Debug - incrementVoteCount para ${newsId}: key=${countKey}, newValue=${newCount}`
      );

      // Establecer TTL para que expire junto con las noticias
      await client.expire(countKey, 86400); // 24 horas
    } catch (error) {
      console.error(
        "❌ Error al incrementar contador de votos:",
        error.message
      );
    }
  }

  /**
   * Obtiene estadísticas generales de votación
   * @returns {Promise<Object>} Estadísticas generales
   */
  async getGeneralStats() {
    try {
      // Obtener total de noticias votadas
      const client = getRedisClient();
      const totalVotedNews = await client.zcard(this.votesKey);

      // Obtener top noticia
      const topNews = await RedisService.zrevrange(this.votesKey, 0, 0, true);

      return {
        totalVotedNews,
        topNews:
          topNews.length > 0
            ? {
                newsId: topNews[0],
                totalScore: parseFloat(topNews[1]),
              }
            : null,
      };
    } catch (error) {
      console.error(
        "❌ Error al obtener estadísticas generales:",
        error.message
      );
      return {
        totalVotedNews: 0,
        topNews: null,
      };
    }
  }
}
