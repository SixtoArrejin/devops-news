import { API_BASE_URL } from "./index.js";

/**
 * Vota por una noticia
 * @param {string} newsId - ID de la noticia (URL u otro identificador)
 * @param {number} score - Puntuación de 1 a 5
 * @returns {Promise<Object>} Resultado de la votación
 */
export const voteForNews = async (newsId, score) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newsId: newsId,
        score: score,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit vote");
    }

    return await response.json();
  } catch (error) {
    console.error("Error voting:", error);
    throw error;
  }
};

/**
 * Obtiene el ranking de noticias más votadas
 * @returns {Promise<Array>} Lista de noticias ordenadas por votos
 */
export const fetchRanking = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ranking`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const result = await response.json();
    const data = result.data || result.ranking || result;

    // Asegurar que devolvemos un array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching ranking:", error);
    throw error;
  }
};

/**
 * Resetea todos los votos
 * @returns {Promise<Object>} Resultado de la operación
 */
export const resetVotes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to reset votes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error resetting votes:", error);
    throw error;
  }
};
