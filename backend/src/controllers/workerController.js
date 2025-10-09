import workerService from "../services/workerService.js";
import { isSuperAdmin } from "../config/permissions.js";

export const createWorker = async (req, res) => {
  try {
    // Forzar tenantId del usuario (excepto superadmin)
    if (!isSuperAdmin(req.user.role)) {
      req.body.tenantId = req.user.tenantId;
    }

    const worker = await workerService.createWorker(req.body);

    res.status(201).json({
      message: "Responsable creado exitosamente",
      worker,
    });
  } catch (error) {
    if (
      error.message === "El email ya está registrado" ||
      error.message === "El email ya está registrado para esta empresa"
    ) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const getAllWorkers = async (req, res) => {
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

    const workers = await workerService.getAllWorkers(filters);

    res.status(200).json({
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const getWorkerById = async (req, res) => {
  try {
    // checkResourceOwnership ya verificó la propiedad
    const worker = await workerService.getWorkerById(req.params.id);

    res.status(200).json(worker);
  } catch (error) {
    if (error.message === "Responsable no encontrado") {
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

export const getWorkersByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Verificar que no esté intentando acceder a otro tenant
    if (
      !isSuperAdmin(req.user.role) &&
      tenantId !== req.user.tenantId?.toString()
    ) {
      return res.status(403).json({
        error: "Sin autorización",
        message: "No puedes acceder a workers de otros tenants",
      });
    }

    const activeOnly = req.query.activeOnly !== "false";
    const workers = await workerService.getWorkersByTenant(
      tenantId,
      activeOnly
    );

    res.status(200).json({
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const updateWorker = async (req, res) => {
  try {
    // No permitir cambiar tenantId
    delete req.body.tenantId;

    const worker = await workerService.updateWorker(req.params.id, req.body);

    res.status(200).json({
      message: "Responsable actualizado exitosamente",
      worker,
    });
  } catch (error) {
    if (
      error.message === "Responsable no encontrado" ||
      error.message === "El email ya está registrado"
    ) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const deactivateWorker = async (req, res) => {
  try {
    const worker = await workerService.deactivateWorker(req.params.id);

    res.status(200).json({
      message: "Responsable desactivado exitosamente",
      worker,
    });
  } catch (error) {
    if (error.message === "Responsable no encontrado") {
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

export const activateWorker = async (req, res) => {
  try {
    const worker = await workerService.activateWorker(req.params.id);

    res.status(200).json({
      message: "Responsable activado exitosamente",
      worker,
    });
  } catch (error) {
    if (error.message === "Responsable no encontrado") {
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

export const deleteWorker = async (req, res) => {
  try {
    const worker = await workerService.deleteWorker(req.params.id);

    res.status(200).json({
      message: "Responsable eliminado permanentemente",
      worker,
    });
  } catch (error) {
    if (error.message === "Responsable no encontrado") {
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
