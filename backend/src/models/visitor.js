import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "La empresa es requerida"],
      trim: true,
    },
    plate: {
      type: String,
      trim: true,
      default: "",
    },
    purpose: {
      type: [String],
      required: true,
    },
    accessZone: {
      type: [String],
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "El responsable es requerido"],
    },
    // workerName: {
    //   type: String,
    //   required: true,
    // },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "El tenant es requerido"],
      index: true,
    },
    signature: {
      type: String, // Base64 de la firma
      required: true,
    },
    documentsAccepted: [
      {
        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Document",
        },
        acceptedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    pdfUrl: {
      type: String,
      required: true,
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices
visitorSchema.index({ tenantId: 1, visitDate: -1 });
visitorSchema.index({ tenantId: 1, createdAt: -1 });

const Visitor =
  mongoose.models.Visitor || mongoose.model("Visitor", visitorSchema);
export default Visitor;
