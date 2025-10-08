import { v2 as cloudinary } from "cloudinary";
import config from "./env.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Prefijo de carpeta según entorno
export const CLOUDINARY_FOLDER_PREFIX =
  config.env === "production" ? "prod" : "dev";

// Helper para generar rutas de carpetas
export const getCloudinaryFolder = (folderName) => {
  return `${CLOUDINARY_FOLDER_PREFIX}/${folderName}`;
};

export default cloudinary;
