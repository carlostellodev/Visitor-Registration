import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";

// Importación de rutas
import authRoutes from "./routes/authRoute.js";
import tenantRoutes from "./routes/tenantRoute.js";
import workerRoutes from "./routes/workerRoute.js";
import documentRoutes from "./routes/documentRoute.js";

const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // Puerto por defecto de Vite
    credentials: true,
  })
);
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/documents", documentRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
