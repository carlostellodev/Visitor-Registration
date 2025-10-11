import documentService from "../services/documentService.js";
import { isSuperAdmin } from "../config/permissions.js";

export const createDocument = async (req, res) => {
  try {
    // Forzar tenantId del usuario (excepto superadmin)
    if (!isSuperAdmin(req.user.role)) {
      req.body.tenantId = req.user.tenantId;
    }

    const document = await documentService.createDocument(req.body);

    res.status(201).json({
      message: "Documento creado exitosamente",
      document,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const filters = {
      isActive:
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
          ? false
          : undefined,
      tenantId: req.query.tenantId,
    };

    // Aplicar filtro de tenant desde middleware
    if (req.tenantFilter) {
      Object.assign(filters, req.tenantFilter);
    }

    const documents = await documentService.getAllDocuments(filters);

    res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    // checkResourceOwnership ya verificó la propiedad
    const document = await documentService.getDocumentById(req.params.id);

    res.status(200).json(document);
  } catch (error) {
    if (error.message === "Documento no encontrado") {
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

export const getDocumentsByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Verificar que no esté intentando acceder a otro tenant
    if (
      !isSuperAdmin(req.user.role) &&
      tenantId !== req.user.tenantId?.toString()
    ) {
      return res.status(403).json({
        error: "Sin autorización",
        message: "No puedes acceder a documentos de otros tenants",
      });
    }

    const activeOnly = req.query.activeOnly !== "false";
    const documents = await documentService.getDocumentsByTenant(
      tenantId,
      activeOnly
    );

    res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const updateDocument = async (req, res) => {
  try {
    // No permitir cambiar tenantId
    delete req.body.tenantId;

    const document = await documentService.updateDocument(
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Documento actualizado exitosamente",
      document,
    });
  } catch (error) {
    if (error.message === "Documento no encontrado") {
      return res.status(400).json({
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

export const deleteDocument = async (req, res) => {
  try {
    const document = await documentService.deleteDocument(req.params.id);

    res.status(200).json({
      message: "Documento desactivado exitosamente",
      document,
    });
  } catch (error) {
    if (error.message === "Documento no encontrado") {
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

export const permanentDeleteDocument = async (req, res) => {
  try {
    const document = await documentService.permanentDeleteDocument(
      req.params.id
    );

    res.status(200).json({
      message: "Documento eliminado permanentemente",
      document,
    });
  } catch (error) {
    if (error.message === "Documento no encontrado") {
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
