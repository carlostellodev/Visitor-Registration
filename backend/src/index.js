import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";

// Importación de rutas
import authRoutes from "./routes/auth.js";

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

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
