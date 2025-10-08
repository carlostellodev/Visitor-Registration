import documentService from "../services/documentService.js";

export const createDocument = async (req, res) => {
  try {
    const document = await documentService.createDocument(req.body);

    res.status(201).json({
      message: "Documento creado exitosamente",
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
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

    const documents = await documentService.getAllDocuments(filters);

    res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    res.status(200).json(document);
  } catch (error) {
    if (error.message === "Documento no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const getDocumentsByTenant = async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly !== "false";
    const documents = await documentService.getDocumentsByTenant(
      req.params.tenantId,
      activeOnly
    );

    res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const updateDocument = async (req, res) => {
  try {
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
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
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
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const permanentDeleteDocument = async (req, res) => {
  try {
    await documentService.permanentDeleteDocument(req.params.id);

    res.status(200).json({
      message: "Documento eliminado permanentemente",
    });
  } catch (error) {
    if (error.message === "Documento no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};
