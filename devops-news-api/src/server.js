import express from "express";
import cors from "cors";
import { serverConfig } from "./config/index.js";
import { connectRedis, closeRedisConnection } from "./config/redis.js";
import { CronService } from "./services/cronService.js";
import routes from "./routes/index.js";
import {
  requestLogger,
  errorHandler,
  notFoundHandler,
  corsHandler,
  basicRateLimit,
  securityHeaders,
} from "./middleware/index.js";

class DevOpsNewsServer {
  constructor() {
    this.app = express();
    this.port = serverConfig.port;
    this.cronService = null;
    this.server = null;
  }

  /**
   * Configura los middlewares de la aplicación
   */
  setupMiddleware() {
    // Middleware de seguridad
    this.app.use(securityHeaders);

    // CORS
    this.app.use(cors());
    this.app.use(corsHandler);

    // Trust proxy para obtener IP real detrás de reverse proxies
    this.app.set("trust proxy", true);

    // Rate limiting básico
    this.app.use(basicRateLimit);

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Logging de requests
    this.app.use(requestLogger);
  }

  /**
   * Configura las rutas de la aplicación
   */
  setupRoutes() {
    // Ruta de bienvenida
    this.app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Bienvenido a DevOps News API",
        version: "1.0.0",
        description: "API para agregación y votación de noticias de DevOps",
        documentation: "/api/health",
        endpoints: {
          health: "/api/health",
          news: "/api/news",
          vote: "/api/vote",
          ranking: "/api/ranking",
        },
        timestamp: new Date().toISOString(),
      });
    });

    // Rutas de la API
    this.app.use("/api", routes);

    // Ruta para información del servidor
    this.app.get("/status", async (req, res) => {
      try {
        const cronStatus = this.cronService
          ? this.cronService.getJobsStatus()
          : null;

        res.json({
          success: true,
          server: {
            status: "running",
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version,
            env: serverConfig.nodeEnv,
          },
          cron: cronStatus,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Error al obtener estado del servidor",
          message: error.message,
        });
      }
    });

    // Middleware para rutas no encontradas
    this.app.use(notFoundHandler);

    // Middleware global de manejo de errores
    this.app.use(errorHandler);
  }

  /**
   * Inicializa la conexión a Redis
   */
  async initializeRedis() {
    try {
      console.log("🔌 Inicializando conexión Redis...");
      const redisClient = connectRedis();
      await redisClient.connect();
      console.log("✅ Conexión Redis establecida correctamente");
    } catch (error) {
      console.error("❌ Error al conectar con Redis:", error.message);
      throw error;
    }
  }

  /**
   * Inicializa los trabajos cron
   */
  initializeCronJobs() {
    try {
      console.log("⏰ Inicializando trabajos cron...");
      this.cronService = new CronService();
      this.cronService.startJobs();
      console.log("✅ Trabajos cron inicializados correctamente");
    } catch (error) {
      console.error("❌ Error al inicializar trabajos cron:", error.message);
      throw error;
    }
  }

  /**
   * Configura los manejadores de señales del sistema
   */
  setupGracefulShutdown() {
    // Manejador para SIGTERM (terminación graceful)
    process.on("SIGTERM", async () => {
      console.log("📨 SIGTERM recibido, iniciando apagado graceful...");
      await this.shutdown();
    });

    // Manejador para SIGINT (Ctrl+C)
    process.on("SIGINT", async () => {
      console.log("📨 SIGINT recibido, iniciando apagado graceful...");
      await this.shutdown();
    });

    // Manejador para errores no capturados
    process.on("uncaughtException", (error) => {
      console.error("❌ Error no capturado:", error);
      this.shutdown().then(() => {
        process.exit(1);
      });
    });

    // Manejador para promesas rechazadas no manejadas
    process.on("unhandledRejection", (reason, promise) => {
      console.error(
        "❌ Promesa rechazada no manejada en:",
        promise,
        "razón:",
        reason
      );
    });
  }

  /**
   * Inicia el servidor
   */
  async start() {
    try {
      console.log("🚀 Iniciando DevOps News API...");

      // Configurar middlewares y rutas
      this.setupMiddleware();
      this.setupRoutes();
      this.setupGracefulShutdown();

      // Inicializar Redis
      await this.initializeRedis();

      // Inicializar trabajos cron
      this.initializeCronJobs();

      // Iniciar servidor HTTP
      this.server = this.app.listen(this.port, () => {
        console.log("🎉 ¡Servidor iniciado exitosamente!");
        console.log(`🌐 Servidor escuchando en http://localhost:${this.port}`);
        console.log(
          `📊 Estado del servidor: http://localhost:${this.port}/status`
        );
        console.log(
          `📚 Documentación de API: http://localhost:${this.port}/api/health`
        );
        console.log(
          `🔄 Actualización automática cada ${
            process.env.NEWS_REFRESH_INTERVAL || 2
          } horas`
        );
        console.log("✨ ¡Listo para servir noticias de DevOps!");
      });

      this.server.on("error", (error) => {
        console.error("❌ Error del servidor:", error.message);

        if (error.code === "EADDRINUSE") {
          console.error(`💥 Puerto ${this.port} ya está en uso`);
          process.exit(1);
        }
      });
    } catch (error) {
      console.error("❌ Error al iniciar servidor:", error.message);
      process.exit(1);
    }
  }

  /**
   * Apaga el servidor de forma graceful
   */
  async shutdown() {
    console.log("🛑 Iniciando apagado del servidor...");

    try {
      // Detener trabajos cron
      if (this.cronService) {
        this.cronService.stopJobs();
        console.log("✅ Trabajos cron detenidos");
      }

      // Cerrar servidor HTTP
      if (this.server) {
        await new Promise((resolve, reject) => {
          this.server.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        console.log("✅ Servidor HTTP cerrado");
      }

      // Cerrar conexión Redis
      await closeRedisConnection();

      console.log("✅ Apagado completado exitosamente");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error durante apagado:", error.message);
      process.exit(1);
    }
  }
}

// Crear e iniciar servidor
const server = new DevOpsNewsServer();
server.start().catch((error) => {
  console.error("💥 Error fatal al iniciar servidor:", error);
  process.exit(1);
});
