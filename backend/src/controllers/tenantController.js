import tenantService from "../services/tenantService.js";

// Crear tenant
export const createTenant = async (req, res) => {
  try {
    const { name, slug, theme, email, phone, address } = req.body;

    // Validar campos requeridos
    if (!name || !slug || !email) {
      return res.status(400).json({
        message: "Todos los campos requeridos deben ser proporcionados",
      });
    }

    const result = await tenantService.createTenant({
      name,
      slug,
      theme,
      email,
      phone,
      address,
    });

    res.status(201).json({
      message: "Tenant creado exitosamente",
      ...result,
    });
  } catch (error) {
    // Error de validación o duplicado
    if (
      error.message === "El email ya está registrado" ||
      error.message === "El slug ya está en uso"
    ) {
      return res.status(400).json({ message: error.message });
    }

    // Error del servidor
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Obtener todos los tenants
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

    const tenants = await tenantService.getAllTenants(filters);

    res.status(200).json({
      count: tenants.length,
      tenants,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Obtener tenant por ID
export const getTenantById = async (req, res) => {
  try {
    const tenant = await tenantService.getTenantById(req.params.id);

    res.status(200).json(tenant);
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Obtener tenant por slug
export const getTenantBySlug = async (req, res) => {
  try {
    const tenant = await tenantService.getTenantBySlug(req.params.slug);

    res.status(200).json(tenant);
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Actualizar tenant
export const updateTenant = async (req, res) => {
  try {
    const tenant = await tenantService.updateTenant(req.params.id, req.body);

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
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Desactivar tenant
export const deactivateTenant = async (req, res) => {
  try {
    const tenant = await tenantService.deactivateTenant(req.params.id);

    res.status(200).json({
      message: "Tenant desactivado exitosamente",
      tenant,
    });
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Activar tenant
export const activateTenant = async (req, res) => {
  try {
    const tenant = await tenantService.activateTenant(req.params.id);

    res.status(200).json({
      message: "Tenant activado exitosamente",
      tenant,
    });
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Eliminar tenant permanentemente
export const deleteTenant = async (req, res) => {
  try {
    await tenantService.deleteTenant(req.params.id);

    res.status(200).json({
      message: "Tenant eliminado permanentemente",
    });
  } catch (error) {
    if (error.message === "Tenant no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};
