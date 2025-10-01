import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    slug: {
      type: String,
      required: [true, "El slug es requerido"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "El slug solo puede contener letras minúsculas, números y guiones",
      ],
      maxlength: [50, "El slug no puede exceder 50 caracteres"],
    },
    theme: {
      primary: {
        type: String,
        default: "#1976d2",
        match: [
          /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          "El color primario debe ser un código hexadecimal válido",
        ],
      },
      secondary: {
        type: String,
        default: "#424242",
        match: [
          /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          "El color secundario debe ser un código hexadecimal válido",
        ],
      },
      logoUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingrese un email válido"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

// Índices para mejorar el rendimiento
tenantSchema.index({ isActive: 1 });

const Tenant = mongoose.model("Tenant", tenantSchema);

export default Tenant;
