import Worker from "../models/worker.js";
import User from "../models/user.js";

class WorkerService {
  // Crear nuevo worker
  async createWorker(workerData) {
    // Validar que el email sea único si se proporciona
    if (workerData.email) {
      const existingWorker = await Worker.findOne({
        email: workerData.email,
        tenantId: workerData.tenantId,
      });

      if (existingWorker) {
        throw new Error("El email ya está registrado para esta empresa");
      }

      // Verificar si existe un user con ese email en el mismo tenant
      const existingUser = await User.findOne({
        email: workerData.email,
        tenantId: workerData.tenantId,
      });

      if (existingUser) {
        workerData.userId = existingUser._id;
        // Usar el nombre del user si no se proporciona
        if (!workerData.name) {
          workerData.name = existingUser.name;
        }
      }
    }

    const worker = new Worker(workerData);
    await worker.save();

    return worker.toObject();
  }

  // Obtener todos los workers
  async getAllWorkers(filters = {}) {
    const query = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.tenantId) {
      query.tenantId = filters.tenantId;
    }

    const workers = await Worker.find(query)
      .populate("userId", "name email role")
      .sort({ name: 1 })
      .lean();

    return workers;
  }

  // Obtener worker por ID
  async getWorkerById(id) {
    const worker = await Worker.findById(id)
      .populate("userId", "name email role")
      .lean();

    if (!worker) {
      throw new Error("Responsable no encontrado");
    }

    return worker;
  }

  // Obtener workers por tenant
  async getWorkersByTenant(tenantId, activeOnly = true) {
    const query = { tenantId };

    if (activeOnly) {
      query.isActive = true;
    }

    const workers = await Worker.find(query)
      .select("_id name email")
      .sort({ name: 1 })
      .lean();

    return workers;
  }

  // Actualizar worker
  async updateWorker(id, updateData) {
    // Validar email único si se está actualizando
    if (updateData.email) {
      const existingWorker = await Worker.findOne({
        _id: { $ne: id },
        email: updateData.email,
        tenantId: updateData.tenantId,
      });

      if (existingWorker) {
        throw new Error("El email ya está registrado");
      }
    }

    const worker = await Worker.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!worker) {
      throw new Error("Responsable no encontrado");
    }

    return worker;
  }

  // Desactivar worker (soft delete)
  async deactivateWorker(id) {
    const worker = await Worker.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();

    if (!worker) {
      throw new Error("Responsable no encontrado");
    }

    return worker;
  }

  // Activar worker
  async activateWorker(id) {
    const worker = await Worker.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).lean();

    if (!worker) {
      throw new Error("Responsable no encontrado");
    }

    return worker;
  }

  // Eliminar permanentemente
  async deleteWorker(id) {
    const worker = await Worker.findByIdAndDelete(id);

    if (!worker) {
      throw new Error("Responsable no encontrado");
    }

    return worker.toObject();
  }
}

export default new WorkerService();
