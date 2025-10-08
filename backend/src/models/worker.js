import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email no válido"],
    },
    // phone: {
    //   type: String,
    //   trim: true,
    // },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "El tenant es requerido"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
workerSchema.index({ tenantId: 1, isActive: 1 });
workerSchema.index({ tenantId: 1, name: 1 });

const Worker = mongoose.models.Worker || mongoose.model("Worker", workerSchema);
export default Worker;
