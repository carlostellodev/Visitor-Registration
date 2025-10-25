// utils/imageLoader.js
import axios from "axios";

export const loadImageFromUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 5000, // Timeout de 5 segundos
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error cargando imagen:", error.message);
    return null;
  }
};
