import cron from "node-cron";
import { NewsService } from "./newsService.js";
import { newsApiConfig } from "../config/index.js";

export class CronService {
  constructor() {
    this.newsService = new NewsService();
    this.refreshInterval = newsApiConfig.refreshInterval; // valor numérico
    this.refreshUnit = newsApiConfig.refreshUnit; // unidad (minutes o hours)
    this.isRunning = false;
    this.jobs = [];
  }

  /**
   * Inicia todos los trabajos cron programados
   */
  startJobs() {
    console.log("⏰ Iniciando trabajos cron programados...");

    // Job para actualizar noticias cada N horas
    const newsRefreshCron = this.createNewsRefreshCron();

    // Job para limpiar estadísticas antiguas (diario)
    const cleanupCron = this.createCleanupCron();

    // Job de estadísticas cada 6 horas
    const statsCron = this.createStatsCron();

    this.jobs.push(newsRefreshCron, cleanupCron, statsCron);

    console.log(`✅ ${this.jobs.length} trabajos cron iniciados correctamente`);
    this.isRunning = true;

    // Ejecutar una actualización inicial si no hay datos en cache
    this.performInitialUpdate();
  }

  /**
   * Detiene todos los trabajos cron
   */
  stopJobs() {
    console.log("⏹️ Deteniendo trabajos cron...");

    this.jobs.forEach((job) => {
      if (job) {
        job.stop();
      }
    });

    this.jobs = [];
    this.isRunning = false;
    console.log("✅ Todos los trabajos cron detenidos");
  }

  /**
   * Crea el trabajo cron para actualizar noticias
   */
  createNewsRefreshCron() {
    // Crear patrón cron basado en el intervalo y unidad configurados
    const cronPattern = this.generateCronPattern(
      this.refreshInterval,
      this.refreshUnit
    );

    console.log(
      `📅 Programando actualización de noticias: cada ${this.refreshInterval} ${this.refreshUnit} (${cronPattern})`
    );

    return cron.schedule(
      cronPattern,
      async () => {
        try {
          const timestamp = new Date().toISOString();
          console.log(
            `🔄 [${timestamp}] INICIANDO actualización automática de noticias...`
          );
          console.log(
            `⏰ Programado cada ${this.refreshInterval} ${this.refreshUnit}`
          );

          const startTime = Date.now();

          console.log(
            "📡 Consultando NewsAPI para obtener noticias frescas..."
          );
          const freshNews = await this.newsService.refreshNewsCache();

          const duration = Date.now() - startTime;
          const endTimestamp = new Date().toISOString();
          console.log(
            `✅ [${endTimestamp}] COMPLETADA actualización automática en ${duration}ms`
          );
          console.log(`📰 Total de noticias obtenidas: ${freshNews.length}`);
          console.log(
            `🕐 Próxima actualización en ${this.refreshInterval} ${this.refreshUnit}`
          );
        } catch (error) {
          console.error(
            "❌ Error en actualización automática de noticias:",
            error.message
          );

          // En caso de error, intentar nuevamente en 30 minutos
          setTimeout(async () => {
            console.log("🔄 Reintentando actualización de noticias...");
            try {
              await this.newsService.refreshNewsCache();
              console.log("✅ Actualización de reintento exitosa");
            } catch (retryError) {
              console.error(
                "❌ Error en reintento de actualización:",
                retryError.message
              );
            }
          }, 30 * 60 * 1000); // 30 minutos
        }
      },
      {
        scheduled: true,
        timezone: "America/Argentina/Buenos_Aires", // Ajusta según tu zona horaria
      }
    );
  }

  /**
   * Crea el trabajo cron para limpiar datos antiguos
   */
  createCleanupCron() {
    // Ejecutar limpieza diaria a las 3:00 AM
    const cronPattern = "0 3 * * *";

    console.log("🧹 Programando limpieza diaria de datos antiguos: 3:00 AM");

    return cron.schedule(
      cronPattern,
      async () => {
        try {
          console.log("🧹 Ejecutando limpieza de datos antiguos...");

          // Aquí podrías implementar limpieza de datos antiguos
          // Por ahora solo registrar el evento
          console.log("✅ Limpieza de datos antiguos completada");
        } catch (error) {
          console.error(
            "❌ Error en limpieza de datos antiguos:",
            error.message
          );
        }
      },
      {
        scheduled: true,
        timezone: "America/Argentina/Buenos_Aires",
      }
    );
  }

  /**
   * Crea el trabajo cron para generar estadísticas
   */
  createStatsCron() {
    // Ejecutar estadísticas cada 6 horas
    const cronPattern = "0 */6 * * *";

    console.log("📊 Programando generación de estadísticas: cada 6 horas");

    return cron.schedule(
      cronPattern,
      async () => {
        try {
          console.log("📊 Generando estadísticas periódicas...");

          // Aquí podrías generar y guardar estadísticas
          const cacheInfo = await this.newsService.getCacheInfo();
          console.log("📈 Estadísticas:", cacheInfo);
          console.log("✅ Estadísticas generadas correctamente");
        } catch (error) {
          console.error("❌ Error al generar estadísticas:", error.message);
        }
      },
      {
        scheduled: true,
        timezone: "America/Argentina/Buenos_Aires",
      }
    );
  }

  /**
   * Genera el patrón cron basado en el intervalo y unidad
   * @param {number} interval - Intervalo numérico
   * @param {string} unit - Unidad (minutes, hours)
   * @returns {string} Patrón cron
   */
  generateCronPattern(interval, unit = "hours") {
    if (unit === "minutes") {
      // Para minutos
      if (interval === 1) {
        return "* * * * *"; // Cada minuto
      } else if (interval <= 59) {
        return `*/${interval} * * * *`; // Cada N minutos
      } else {
        throw new Error("Los minutos deben ser <= 59");
      }
    }

    // Para horas (lógica original)
    const hours = interval;
    if (hours === 1) {
      return "0 * * * *"; // Cada hora
    } else if (hours === 2) {
      return "0 */2 * * *"; // Cada 2 horas
    } else if (hours === 3) {
      return "0 */3 * * *"; // Cada 3 horas
    } else if (hours === 6) {
      return "0 */6 * * *"; // Cada 6 horas
    } else if (hours === 12) {
      return "0 */12 * * *"; // Cada 12 horas
    } else if (hours === 24) {
      return "0 0 * * *"; // Diario a medianoche
    } else {
      // Para otros valores, usar cada N horas (máximo 24)
      const intervalHours = Math.min(Math.max(hours, 1), 24);
      return `0 */${intervalHours} * * *`;
    }
  }

  /**
   * Realiza una actualización inicial si es necesario
   */
  async performInitialUpdate() {
    try {
      const cacheInfo = await this.newsService.getCacheInfo();

      if (cacheInfo.newsCount === 0) {
        console.log("🚀 No hay noticias en cache, realizando carga inicial...");
        await this.newsService.refreshNewsCache();
        console.log("✅ Carga inicial de noticias completada");
      } else {
        console.log(`ℹ️ Cache ya contiene ${cacheInfo.newsCount} noticias`);
      }
    } catch (error) {
      console.error("❌ Error en carga inicial:", error.message);
    }
  }

  /**
   * Obtiene el estado de los trabajos cron
   * @returns {Object} Estado de los jobs
   */
  getJobsStatus() {
    return {
      isRunning: this.isRunning,
      jobCount: this.jobs.length,
      refreshInterval: this.refreshInterval,
      nextExecutions: this.jobs
        .map((job) => {
          if (job && typeof job.getNextExecutionTime === "function") {
            return job.getNextExecutionTime();
          }
          return null;
        })
        .filter(Boolean),
    };
  }

  /**
   * Ejecuta manualmente la actualización de noticias
   */
  async triggerManualUpdate() {
    console.log("🎯 Actualizaci��n manual de noticias disparada");
    try {
      const freshNews = await this.newsService.refreshNewsCache();
      console.log(
        `✅ Actualización manual completada: ${freshNews.length} noticias`
      );
      return { success: true, count: freshNews.length };
    } catch (error) {
      console.error("❌ Error en actualización manual:", error.message);
      throw error;
    }
  }
}
