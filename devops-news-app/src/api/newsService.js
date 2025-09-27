import { API_BASE_URL } from "./index.js";

/**
 * Obtiene todas las noticias con información de votación
 * @returns {Promise<Array>} Lista de noticias enriquecidas
 */
export const fetchNews = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/news`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const result = await response.json();
    // La API devuelve {success: true, data: [...]}
    const data = result.data || result.articles || result.news || result;
    // Asegurar que devolvemos un array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

/**
 * Fuerza la actualización del cache de noticias
 * @returns {Promise<Object>} Resultado de la operación
 */
export const refreshNews = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh news");
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing news:", error);
    throw error;
  }
};
