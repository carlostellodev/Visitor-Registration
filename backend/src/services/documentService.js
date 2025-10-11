import Document from "../models/document.js";

class DocumentService {
  async createDocument(documentData) {
    const document = new Document(documentData);
    await document.save();
    return document.toObject();
  }

  async getAllDocuments(filters = {}) {
    const query = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.tenantId) {
      query.tenantId = filters.tenantId;
    }

    const documents = await Document.find(query)
      .populate("tenantId", "name slug")
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return documents;
  }

  async getDocumentById(id) {
    const document = await Document.findById(id)
      .populate("tenantId", "name slug")
      .lean();

    if (!document) {
      throw new Error("Documento no encontrado");
    }

    return document;
  }

  async getDocumentsByTenant(tenantId, activeOnly = true) {
    const query = { tenantId };

    if (activeOnly) {
      query.isActive = true;
    }

    const documents = await Document.find(query)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return documents;
  }

  async updateDocument(id, updateData) {
    const document = await Document.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!document) {
      throw new Error("Documento no encontrado");
    }

    return document;
  }

  async deleteDocument(id) {
    const document = await Document.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();

    if (!document) {
      throw new Error("Documento no encontrado");
    }

    return document;
  }

  async permanentDeleteDocument(id) {
    const document = await Document.findByIdAndDelete(id);

    if (!document) {
      throw new Error("Documento no encontrado");
    }

    return document.toObject();
  }
}

export default new DocumentService();
