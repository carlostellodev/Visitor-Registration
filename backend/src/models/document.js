import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, "La URL del archivo es requerida"],
    },
    fileType: {
      type: String,
      enum: ["pdf", "image"],
      default: "pdf",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "El tenant es requerido"],
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

documentSchema.index({ tenantId: 1, isActive: 1, order: 1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
