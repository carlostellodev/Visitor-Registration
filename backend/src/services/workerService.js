import Worker from "../models/worker.js";
import User from "../models/user.js";

class WorkerService {
  async createWorker(workerData) {
    if (workerData.email) {
      const existingWorker = await Worker.findOne({
        email: workerData.email,
        tenantId: workerData.tenantId,
      });

      if (existingWorker) {
        throw new Error("El email ya está registrado para esta empresa");
      }

      const existingUser = await User.findOne({
        email: workerData.email,
        tenantId: workerData.tenantId,
      });

      if (existingUser) {
        workerData.userId = existingUser._id;
        if (!workerData.name) {
          workerData.name = existingUser.name;
        }
      }
    }

    const worker = new Worker(workerData);
    await worker.save();

    return worker.toObject();
  }

  async getAllWorkers(filters = {}) {
    const query = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.tenantId) {
      query.tenantId = filters.tenantId;
    }

    const workers = await Worker.find(query)
      .populate("tenantId", "name slug")
      .populate("userId", "name email role")
      .sort({ name: 1 })
      .lean();

    return workers;
  }

  async getWorkerById(id) {
    const worker = await Worker.findById(id)
      .populate("tenantId", "name slug")
      .populate("userId", "name email role")
      .lean();

    if (!worker) {
      throw new Error("Responsable no encontrado");
    }

    return worker;
  }

  async getWorkersByTenant(tenantId, activeOnly = true) {
    const query = { tenantId };

    if (activeOnly) {
      query.isActive = true;
    }

    const workers = await Worker.find(query)
      .select("_id name email phone department")
      .sort({ name: 1 })
      .lean();

    return workers;
  }

  async updateWorker(id, updateData) {
    if (updateData.email) {
      // Obtener el worker actual para saber su tenant
      const currentWorker = await Worker.findById(id);
      if (!currentWorker) {
        throw new Error("Responsable no encontrado");
      }

      const existingWorker = await Worker.findOne({
        _id: { $ne: id },
        email: updateData.email,
        tenantId: currentWorker.tenantId,
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

  async deleteWorker(id) {
    const worker = await Worker.findByIdAndDelete(id);

    if (!worker) {
      throw new Error("Responsable no encontrado");
    }

    return worker.toObject();
  }
}

export default new WorkerService();
