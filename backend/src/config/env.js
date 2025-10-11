import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determinar qué archivo .env cargar según NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

// Cargar el archivo de entorno correspondiente
const envPath = path.resolve(__dirname, "../../", envFile);
dotenv.config({ path: envPath });

// Validar variables de entorno requeridas
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "ALLOW_REGISTER",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("❌ Error: Faltan las siguientes variables de entorno:");
  missingEnvVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error(`\n📄 Archivo buscado: ${envPath}`);
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !isProduction;

// Exportar configuración organizada
export const config = {
  // Entorno
  env: process.env.NODE_ENV || "development",
  isDevelopment,
  isProduction,

  // Servidor
  port: parseInt(process.env.PORT) || 3000,

  // Base de datos
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: isProduction ? 10 : 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "24h",
  },

  // Autenticación
  auth: {
    allow_register: process.env.ALLOW_REGISTER || "true",
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },

  // Rate Limiter for login requests
  rateLimiter: {
    maxAttempts: 5,
    lockDuration: 1 * 60 * 1000,
    resetTime: 60 * 60 * 1000,
  },
};

export default config;
