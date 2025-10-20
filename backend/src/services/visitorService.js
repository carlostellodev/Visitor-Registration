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

  async getVisitorsByTenantAndDate(tenantId, date) {
    const searchDate = new Date(date);

    // Establecer el inicio del día (00:00:00)
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Establecer el fin del día (23:59:59)
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      tenantId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    const visitors = await Visitor.find(query)
      .populate("workerId", "name email")
      .populate("tenantId", "name slug")
      .sort({ createdAt: -1 }) // Ordenar por hora de creación (más reciente primero)
      .lean();

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
