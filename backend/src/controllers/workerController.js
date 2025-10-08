import workerService from "../services/workerService.js";

// Crear worker
export const createWorker = async (req, res) => {
  try {
    const worker = await workerService.createWorker(req.body);

    res.status(201).json({
      message: "Responsable creado exitosamente",
      worker,
    });
  } catch (error) {
    if (
      error.message === "El email ya está registrado" ||
      error.message === "El email ya está registrado para este tenant"
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Obtener todos los workers
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

    const workers = await workerService.getAllWorkers(filters);

    res.status(200).json({
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Obtener worker por ID
export const getWorkerById = async (req, res) => {
  try {
    const worker = await workerService.getWorkerById(req.params.id);

    res.status(200).json(worker);
  } catch (error) {
    if (error.message === "Responsable no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Obtener workers por tenant
export const getWorkersByTenant = async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly !== "false"; // Por defecto true
    const workers = await workerService.getWorkersByTenant(
      req.params.tenantId,
      activeOnly
    );

    res.status(200).json({
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Actualizar worker
export const updateWorker = async (req, res) => {
  try {
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
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Desactivar worker
export const deactivateWorker = async (req, res) => {
  try {
    const worker = await workerService.deactivateWorker(req.params.id);

    res.status(200).json({
      message: "Responsable desactivado exitosamente",
      worker,
    });
  } catch (error) {
    if (error.message === "Responsable no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Activar worker
export const activateWorker = async (req, res) => {
  try {
    const worker = await workerService.activateWorker(req.params.id);

    res.status(200).json({
      message: "Responsable activado exitosamente",
      worker,
    });
  } catch (error) {
    if (error.message === "Responsable no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Eliminar worker permanentemente
export const deleteWorker = async (req, res) => {
  try {
    await workerService.deleteWorker(req.params.id);

    res.status(200).json({
      message: "Responsable eliminado permanentemente",
    });
  } catch (error) {
    if (error.message === "Responsable no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};
