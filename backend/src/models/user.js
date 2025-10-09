import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: 6,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "El tenant es requerido"],
      index: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "user"],
      default: "user",
    },
    security: {
      loginAttempts: {
        type: Number,
        default: 0,
        select: false, // No incluir por defecto en queries
      },
      lastFailedLogin: {
        type: Date,
        default: null,
        select: false,
      },
      lastLogin: {
        type: Date,
        default: null,
      },
      lastLoginIp: {
        type: String,
        default: null,
      },
      lockUntil: {
        type: Date,
        default: null,
        select: false,
      },
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

// Encriptar contraseña antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Índices compuestos para búsquedas eficientes
userSchema.index({ email: 1, tenantId: 1 });
userSchema.index({ tenantId: 1, isActive: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
