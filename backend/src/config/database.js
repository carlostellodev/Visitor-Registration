import mongoose from "mongoose";
import config from "./env.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      config.mongodb.uri,
      config.mongodb.options
    );

    // Manejar eventos de conexión
    mongoose.connection.on("error", (err) => {
      console.error("Error de MongoDB:", err.message);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("\nMongoDB desconectado - Aplicación cerrada");
        process.exit(0);
      } catch (err) {
        console.error("Error al cerrar MongoDB:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
