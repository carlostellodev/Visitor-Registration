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

  async getVisitorsByTenantAndDate(tenantId, dateInput) {
    console.log("Fecha que viene del frontend: ", dateInput);

    // Convertir la fecha a un objeto Date de JavaScript
    // Si viene como ISO string desde Vue (selectedDate.value), funcionará directamente
    const searchDate = new Date(dateInput);

    // Verificar que la fecha es válida
    if (isNaN(searchDate.getTime())) {
      throw new Error("Fecha inválida");
    }

    // Obtener componentes de la fecha en la zona horaria local
    const year = searchDate.getFullYear();
    const month = searchDate.getMonth();
    const day = searchDate.getDate();

    // Crear las fechas de inicio y fin del día en la zona horaria local
    // Esto asegura que buscamos por el día completo independientemente de la zona horaria
    const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

    console.log("Búsqueda desde: ", startOfDay.toISOString());
    console.log("Búsqueda hasta: ", endOfDay.toISOString());
    console.log("Rango local: ", {
      inicio: startOfDay.toLocaleString("es-ES"),
      fin: endOfDay.toLocaleString("es-ES"),
    });

    // IMPORTANTE: Cambiado de 'createdAt' a 'visitDate' para ser consistente
    // con el resto del servicio
    const query = {
      tenantId,
      visitDate: {
        // Cambio aquí: usar visitDate en lugar de createdAt
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    const visitors = await Visitor.find(query)
      .populate("workerId", "name email")
      .populate("tenantId", "name slug")
      .sort({ visitDate: -1 }) // Cambio aquí: ordenar por visitDate
      .lean();

    console.log(
      `Encontrados ${
        visitors.length
      } visitantes para el ${startOfDay.toLocaleDateString("es-ES")}`
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
