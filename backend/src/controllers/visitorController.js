import visitorService from "../services/visitorService.js";
import { uploadPDFToCloudinary } from "../utils/uploadPDF.js";

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
        message: "Faltan campos requeridos",
      });
    }

    // Validar que se subió el PDF
    if (!req.file) {
      return res.status(400).json({
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
    console.error("Error creando visitor:", error);
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
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

    const visitors = await visitorService.getAllVisitors(filters);

    res.status(200).json({
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const visitor = await visitorService.getVisitorById(req.params.id);
    res.status(200).json(visitor);
  } catch (error) {
    if (error.message === "Visita no encontrada") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const getVisitorsByTenant = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const visitors = await visitorService.getVisitorsByTenant(
      req.params.tenantId,
      filters
    );

    res.status(200).json({
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const deleteVisitor = async (req, res) => {
  try {
    await visitorService.deleteVisitor(req.params.id);

    res.status(200).json({
      message: "Visita eliminada exitosamente",
    });
  } catch (error) {
    if (error.message === "Visita no encontrada") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};
