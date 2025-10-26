import visitorService from "../services/visitorService.js";
import { generateExcel, generatePDF } from "../utils/exportFiles.js";
import { uploadPDFToCloudinary } from "../utils/uploadPDF.js";
import { isSuperAdmin } from "../config/permissions.js";

export const createVisitor = async (req, res) => {
  try {
    const {
      name,
      company,
      plate,
      purpose,
      accessZone,
      workerId,
      tenantId,
      signature,
      documentsAccepted,
    } = req.body;

    // Validar campos requeridos
    if (!name || !company || !workerId || !tenantId || !signature) {
      return res.status(400).json({
        error: "Campos requeridos",
        message:
          "Faltan campos requeridos: name, company, workerId, tenantId, signature",
      });
    }

    // Validar que el usuario esté creando en su propio tenant (excepto superadmin)
    if (
      !isSuperAdmin(req.user.role) &&
      tenantId !== req.user.tenantId?.toString()
    ) {
      return res.status(403).json({
        error: "Sin autorización",
        message: "No puedes registrar visitantes en otros tenants",
      });
    }

    // Validar que se subió el PDF
    if (!req.file) {
      return res.status(400).json({
        error: "PDF requerido",
        message: "El PDF es requerido",
      });
    }

    // Subir PDF a Cloudinary
    const filename = `visit_${tenantId}_${Date.now()}`;
    const pdfUrl = await uploadPDFToCloudinary(req.file.buffer, filename);

    // Crear visitor
    const visitor = await visitorService.createVisitor({
      name,
      company,
      plate: plate || "",
      purpose: JSON.parse(purpose),
      accessZone: JSON.parse(accessZone),
      workerId,
      tenantId,
      signature,
      documentsAccepted: documentsAccepted ? JSON.parse(documentsAccepted) : [],
      pdfUrl,
    });

    res.status(201).json({
      message: "Visita registrada exitosamente",
      visitor,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const getAllVisitors = async (req, res) => {
  try {
    const filters = {
      tenantId: req.query.tenantId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    // Aplicar filtro de tenant desde middleware
    if (req.tenantFilter) {
      Object.assign(filters, req.tenantFilter);
    }

    const visitors = await visitorService.getAllVisitors(filters);

    res.status(200).json({
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const getVisitorById = async (req, res) => {
  try {
    // checkResourceOwnership ya verificó la propiedad
    const visitor = await visitorService.getVisitorById(req.params.id);

    res.status(200).json(visitor);
  } catch (error) {
    if (error.message === "Visita no encontrada") {
      return res.status(404).json({
        error: "No encontrado",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const getVisitorsByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Verificar que no esté intentando acceder a otro tenant
    if (
      !isSuperAdmin(req.user.role) &&
      tenantId !== req.user.tenantId?.toString()
    ) {
      return res.status(403).json({
        error: "Sin autorización",
        message: "No puedes acceder a visitantes de otros tenants",
      });
    }

    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const visitors = await visitorService.getVisitorsByTenant(
      tenantId,
      filters
    );

    res.status(200).json({
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const getVisitorsByTenantAndDate = async (req, res) => {
  try {
    const { tenantId, date } = req.params;
    if (
      !isSuperAdmin(req.user.role) &&
      tenantId !== req.user.tenantId?.toString()
    ) {
      return res.status(403).json({
        error: "Sin autorización",
        message: "No puedes acceder a visitantes de otros tenants",
      });
    }

    // Validar formato de fecha
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        error: "Fecha inválida",
        message:
          "El formato de fecha debe ser YYYY-MM-DD o un formato válido ISO",
      });
    }

    const visitors = await visitorService.getVisitorsByTenantAndDate(
      tenantId,
      date
    );

    res.status(200).json({
      date: dateObj.toISOString().split("T")[0],
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const exportVisitors = async (req, res) => {
  try {
    const { tenantId, startDate, endDate, format } = req.body;

    // Validar campos requeridos
    if (!tenantId || !startDate || !endDate || !format) {
      return res.status(400).json({
        error: "Campos requeridos",
        message: "Faltan campos",
      });
    }

    if (!["pdf", "excel"].includes(format)) {
      return res.status(400).json({
        error: "Formato inválido",
        message: "El formato debe ser 'pdf' o 'excel'",
      });
    }

    if (
      !isSuperAdmin(req.user.role) &&
      tenantId !== req.user.tenantId?.toString()
    ) {
      return res.status(403).json({
        error: "Sin autorización",
        message: "No puedes exportar visitantes de otros tenants",
      });
    }

    const visitors = await visitorService.getVisitorsByDateRange(
      tenantId,
      startDate,
      endDate
    );

    if (visitors.length === 0) {
      return res.status(404).json({
        error: "Sin datos",
        message: "No hay visitantes en el rango de fechas seleccionado",
      });
    }

    // Obtener información del tenant
    const tenantName = visitors[0]?.tenantId?.name || "Tenant";
    const tenantLogo = visitors[0]?.tenantId?.theme?.logoUrl;

    // Generar archivo según formato
    if (format === "excel") {
      const buffer = await generateExcel(visitors, tenantName);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } else if (format === "pdf") {
      const buffer = await generatePDF(visitors, tenantName, tenantLogo);
      res.setHeader("Content-Type", "application/pdf");
      res.send(buffer);
    }
  } catch (error) {
    console.error("Error exportando visitantes:", error);
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const deleteVisitor = async (req, res) => {
  try {
    const visitor = await visitorService.deleteVisitor(req.params.id);

    res.status(200).json({
      message: "Visita eliminada exitosamente",
      visitor,
    });
  } catch (error) {
    if (error.message === "Visita no encontrada") {
      return res.status(404).json({
        error: "No encontrado",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};
