/**
 * Archivo de índice para los servicios de API
 * Exporta todos los servicios disponibles para facilitar las importaciones
 */

// Configuración centralizada de la API
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Servicios de noticias
export { fetchNews, refreshNews } from "./newsService";

// Servicios de votación
export { voteForNews, fetchRanking } from "./votingService";

// Servicios administrativos
export {
  adminRefreshNews,
  adminResetSystem,
  getSystemStats,
} from "./adminService";
