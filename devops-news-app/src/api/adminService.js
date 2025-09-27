import { refreshNews } from "./newsService";
import { API_BASE_URL } from "./index.js";

/**
 * Servicio para operaciones administrativas
 */

/**
 * Actualiza el cache de noticias
 * @returns {Promise<Object>} Resultado de la operación
 */
export const adminRefreshNews = async () => {
  return await refreshNews();
};

/**
 * Resetea completamente el sistema (noticias y votos)
 * @returns {Promise<Object>} Resultado de la operación
 */
export const adminResetSystem = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to reset system");
    }

    return await response.json();
  } catch (error) {
    console.error("Error resetting system:", error);
    throw error;
  }
};

/**
 * Obtiene estadísticas del sistema
 * @returns {Promise<Object>} Estadísticas del sistema
 */
export const getSystemStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};
