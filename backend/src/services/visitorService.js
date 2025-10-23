import Visitor from "../models/visitor.js";

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
    console.log("Fecha que viene del frontend: ", dateString);

    // Parsear YYYY-MM-DD
    const [year, month, day] = dateString.split("-").map(Number);

    // Crear inicio y fin del día en UTC directamente
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    console.log("Búsqueda desde: ", startOfDay.toISOString());
    console.log("Búsqueda hasta: ", endOfDay.toISOString());

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

    console.log(
      `Encontrados ${visitors.length} visitantes para el ${day}/${month}/${year}`
    );

    return visitors;
  }

  async deleteVisitor(id) {
    const visitor = await Visitor.findByIdAndDelete(id);

    if (!visitor) {
      throw new Error("Visita no encontrada");
    }

    return visitor.toObject();
  }
}

export default new VisitorService();
