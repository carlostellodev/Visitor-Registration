import tenantService from "../services/tenantService.js";
import { isSuperAdmin } from "../config/permissions.js";

export const createTenant = async (req, res) => {
  try {
    const tenant = await tenantService.createTenant(req.body);

    res.status(201).json({
      message: "Tenant creado exitosamente",
      tenant,
    });
  } catch (error) {
    if (
      error.message === "El email ya está registrado" ||
      error.message === "El slug ya está en uso"
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

export const getAllTenants = async (req, res) => {
  try {
    const filters = {
      isActive:
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
          ? false
          : undefined,
    };

    const tenants = isSuperAdmin(req.user.role)
      ? await tenantService.getAllTenants(filters)
      : await tenantService.getTenantsByIds([req.user.tenantId], filters);

    res.status(200).json({
      count: tenants.length,
      tenants,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isSuperAdmin(req.user.role) && id !== req.user.tenantId?.toString()) {
      return res.status(403).json({
        error: "Sin autorización",
        message: "No puedes acceder a información de otros tenants",
      });
    }

    const tenant = await tenantService.getTenantById(id);

    res.status(200).json(tenant);
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
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

export const getTenantBySlug = async (req, res) => {
  try {
    const tenant = await tenantService.getTenantBySlug(req.params.slug);

    res.status(200).json(tenant);
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
      return res.status(404).json({
        error: "No encontrado",
        message: "La organización no existe o está inactiva",
      });
    }

    res.status(500).json({
      error: "Error en el servidor",
      message: error.message,
    });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isSuperAdmin(req.user.role) && id !== req.user.tenantId?.toString()) {
      return res.status(403).json({
        error: "Sin autorización",
        message: "No puedes actualizar información de otros tenants",
      });
    }

    const tenant = await tenantService.updateTenant(id, req.body);

    res.status(200).json({
      message: "Tenant actualizado exitosamente",
      tenant,
    });
  } catch (error) {
    if (
      error.message === "Tenant no encontrado" ||
      error.message === "El email ya está registrado" ||
      error.message === "El slug ya está en uso"
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

export const deactivateTenant = async (req, res) => {
  try {
    const tenant = await tenantService.deactivateTenant(req.params.id);

    res.status(200).json({
      message: "Tenant desactivado exitosamente",
      tenant,
    });
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
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

export const activateTenant = async (req, res) => {
  try {
    const tenant = await tenantService.activateTenant(req.params.id);

    res.status(200).json({
      message: "Tenant activado exitosamente",
      tenant,
    });
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
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

export const deleteTenant = async (req, res) => {
  try {
    const tenant = await tenantService.deleteTenant(req.params.id);

    res.status(200).json({
      message: "Tenant eliminado permanentemente",
      tenant,
    });
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
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
