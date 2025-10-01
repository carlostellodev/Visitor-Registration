import Tenant from "../models/Tenant.js";

class TenantService {
  // Crear nuevo tenant
  async createTenant({ name, slug, theme, email, phone, address }) {
    const existingTenant = await Tenant.findOne({
      $or: [{ email }, { slug }],
    });

    if (existingTenant) {
      if (existingTenant.email === email) {
        throw new Error("El email ya está registrado");
      }
      if (existingTenant.slug === slug) {
        throw new Error("El slug ya está en uso");
      }
    }

    const tenant = new Tenant({
      name,
      slug,
      theme,
      email,
      phone,
      address,
    });

    await tenant.save();

    return {
      id: tenant._id,
      name: tenant.name,
      slug: tenant.slug,
      theme: tenant.theme,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      isActive: tenant.isActive,
    };
  }

  // Obtener todos los tenants
  async getAllTenants(filters = {}) {
    const query = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const tenants = await Tenant.find(query).sort({ createdAt: -1 });
    return tenants;
  }

  // Obtener tenant por ID
  async getTenantById(id) {
    const tenant = await Tenant.findById(id);

    if (!tenant) {
      throw new Error("Tenant no encontrado");
    }

    return tenant;
  }

  // Obtener tenant por slug
  async getTenantBySlug(slug) {
    const tenant = await Tenant.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    });

    if (!tenant) {
      throw new Error("Tenant no encontrado");
    }

    return {
      id: tenant._id,
      name: tenant.name,
      slug: tenant.slug,
      theme: tenant.theme,
      isActive: tenant.isActive,
    };
  }

  // Actualizar tenant
  async updateTenant(id, updateData) {
    if (updateData.email || updateData.slug) {
      const existingTenant = await Tenant.findOne({
        _id: { $ne: id },
        $or: [
          ...(updateData.email ? [{ email: updateData.email }] : []),
          ...(updateData.slug ? [{ slug: updateData.slug }] : []),
        ],
      });

      if (existingTenant) {
        if (existingTenant.email === updateData.email) {
          throw new Error("El email ya está registrado");
        }
        if (existingTenant.slug === updateData.slug) {
          throw new Error("El slug ya está en uso");
        }
      }
    }

    const tenant = await Tenant.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!tenant) {
      throw new Error("Tenant no encontrado");
    }

    return tenant;
  }

  // Desactivar tenant (soft delete)
  async deactivateTenant(id) {
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!tenant) {
      throw new Error("Tenant no encontrado");
    }

    return tenant;
  }

  // Activar tenant
  async activateTenant(id) {
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!tenant) {
      throw new Error("Tenant no encontrado");
    }

    return tenant;
  }

  // Eliminar permanentemente
  async deleteTenant(id) {
    const tenant = await Tenant.findByIdAndDelete(id);

    if (!tenant) {
      throw new Error("Tenant no encontrado");
    }

    return tenant;
  }
}

export default new TenantService();
