import Visitor from "../models/visitor.js";
import { deletePDFFromCloudinary } from "../utils/cloudinaryFiles.js";

class VisitorService {
  async createVisitor(visitorData) {
    const visitor = new Visitor(visitorData);
    await visitor.save();
    return visitor.toObject();
  }

  async getAllVisitors(filters = {}) {
    const query = {};

    if (filters.tenantId) {
      query.tenantId = filters.tenantId;
    }

    if (filters.startDate || filters.endDate) {
      query.visitDate = {};
      if (filters.startDate) {
        query.visitDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.visitDate.$lte = new Date(filters.endDate);
      }
    }

    const visitors = await Visitor.find(query)
      .populate("workerId", "name email")
      .populate("tenantId", "name slug")
      .sort({ visitDate: -1 })
      .lean();

    return visitors;
  }

  async getVisitorById(id) {
    const visitor = await Visitor.findById(id)
      .populate("workerId", "name email")
      .populate("tenantId", "name slug theme")
      .populate("documentsAccepted.documentId", "title")
      .lean();

    if (!visitor) {
      throw new Error("Visita no encontrada");
    }

    return visitor;
  }

  async getVisitorsByTenant(tenantId, filters = {}) {
    const query = { tenantId };

    if (filters.startDate || filters.endDate) {
      query.visitDate = {};
      if (filters.startDate) {
        query.visitDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.visitDate.$lte = new Date(filters.endDate);
      }
    }

    const visitors = await Visitor.find(query)
      .populate("workerId", "name email")
      .sort({ visitDate: -1 })
      .lean();

    return visitors;
  }

  async getVisitorsByTenantAndDate(tenantId, dateString) {
    // Parsear YYYY-MM-DD
    const [year, month, day] = dateString.split("-").map(Number);

    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const query = {
      tenantId,
      visitDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    const visitors = await Visitor.find(query)
      .populate("workerId", "name email")
      .populate("tenantId", "name slug")
      .sort({ visitDate: -1 })
      .lean();

    return visitors;
  }

  async getVisitorsByDateRange(tenantId, startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const query = {
      tenantId,
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    const visitors = await Visitor.find(query)
      .populate("workerId", "name email")
      .populate("tenantId", "name slug theme")
      .sort({ createdAt: -1 })
      .lean();

    return visitors;
  }

  async deleteVisitor(id) {
    const visitor = await Visitor.findById(id);

    if (!visitor) {
      throw new Error("Visita no encontrada");
    }

    if (visitor.pdfUrl) {
      const deleteResult = await deletePDFFromCloudinary(visitor.pdfUrl);
      if (!deleteResult.success) {
        console.error(
          `No se pudo eliminar el PDF de Cloudinary para el visitante ${id}:`,
          deleteResult.error
        );
        // Decidir si continuar o lanzar error según tu lógica de negocio
        // Por ahora, solo logueamos el error y continuamos
      }
    }

    await visitor.deleteOne();

    return visitor.toObject();
  }
}

export default new VisitorService();
