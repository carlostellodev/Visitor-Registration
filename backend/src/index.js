import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config/env.js";
import connectDB from "./config/database.js";

// Importación de rutas
import authRoutes from "./routes/authRoute.js";
import tenantRoutes from "./routes/tenantRoute.js";
import workerRoutes from "./routes/workerRoute.js";
import documentRoutes from "./routes/documentRoute.js";
import visitorRoutes from "./routes/visitor.js";

const app = express();

// Conectar a MongoDB
await connectDB();

// Middlewares de seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS con configuración desde env
app.use(cors(config.cors));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/visitors", visitorRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    environment: config.env,
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "API de V.R. funcionando correctamente",
    version: "1.0.0",
    environment: config.env,
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.path,
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // No exponer detalles en producción
  const statusCode = err.statusCode || 500;
  const message = config.isProduction
    ? "Error interno del servidor"
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(config.isDevelopment && {
      stack: err.stack,
      details: err,
    }),
  });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Servidor iniciado correctamente`);
  console.log(`Puerto: ${PORT}`);
  console.log(`Entorno: ${config.env.toUpperCase()}`);
  console.log(`URL: http://localhost:${PORT}`);
});

// Manejar errores no capturados
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  if (config.isProduction) {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
