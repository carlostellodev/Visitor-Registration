export const PERMISSIONS = {
  // Tenants
  TENANT_READ: "tenant:read",
  TENANT_CREATE: "tenant:create",
  TENANT_UPDATE: "tenant:update",
  TENANT_DELETE: "tenant:delete",
  TENANT_READ_ALL: "tenant:read:all",

  // Users
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_READ_ALL: "user:read:all",

  // Workers
  WORKER_READ: "worker:read",
  WORKER_CREATE: "worker:create",
  WORKER_UPDATE: "worker:update",
  WORKER_DELETE: "worker:delete",

  // Documents
  DOCUMENT_READ: "document:read",
  DOCUMENT_CREATE: "document:create",
  DOCUMENT_UPDATE: "document:update",
  DOCUMENT_DELETE: "document:delete",

  // Visitors
  VISITOR_READ: "visitor:read",
  VISITOR_CREATE: "visitor:create",
  VISITOR_UPDATE: "visitor:update",
  VISITOR_DELETE: "visitor:delete",

  // System
  SYSTEM_SETTINGS: "system:settings",
  SYSTEM_LOGS: "system:logs",
};

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  USER: "user",
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: [
    // Tenants
    PERMISSIONS.TENANT_READ_ALL,
    PERMISSIONS.TENANT_CREATE,
    PERMISSIONS.TENANT_UPDATE,
    PERMISSIONS.TENANT_DELETE,

    // Users
    PERMISSIONS.USER_READ_ALL,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,

    // Workers
    PERMISSIONS.WORKER_READ,
    PERMISSIONS.WORKER_CREATE,
    PERMISSIONS.WORKER_UPDATE,
    PERMISSIONS.WORKER_DELETE,

    // Documents
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_UPDATE,
    PERMISSIONS.DOCUMENT_DELETE,

    // Visitors
    PERMISSIONS.VISITOR_READ,
    PERMISSIONS.VISITOR_CREATE,
    PERMISSIONS.VISITOR_UPDATE,
    PERMISSIONS.VISITOR_DELETE,

    // System
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.SYSTEM_LOGS,
  ],

  [ROLES.ADMIN]: [
    // Tenant (solo el suyo)
    PERMISSIONS.TENANT_READ,
    PERMISSIONS.TENANT_UPDATE,

    // Users (solo de su tenant)
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,

    // Workers
    PERMISSIONS.WORKER_READ,
    PERMISSIONS.WORKER_CREATE,
    PERMISSIONS.WORKER_UPDATE,
    PERMISSIONS.WORKER_DELETE,

    // Documents
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_UPDATE,
    PERMISSIONS.DOCUMENT_DELETE,

    // Visitors
    PERMISSIONS.VISITOR_READ,
    PERMISSIONS.VISITOR_CREATE,
    PERMISSIONS.VISITOR_UPDATE,
    PERMISSIONS.VISITOR_DELETE,
  ],

  [ROLES.USER]: [
    // Tenant
    PERMISSIONS.TENANT_READ,

    // Workers
    PERMISSIONS.WORKER_READ,

    // Documents
    PERMISSIONS.DOCUMENT_READ,

    // Visitors
    PERMISSIONS.VISITOR_CREATE,
  ],
};

// ============================================
// Helpers
// ============================================
export function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

export function hasAnyPermission(role, permissionList) {
  return permissionList.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role, permissionList) {
  return permissionList.every((permission) => hasPermission(role, permission));
}

export function isSuperAdmin(role) {
  return role === ROLES.SUPERADMIN;
}

export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

export function isUser(role) {
  return role === ROLES.USER;
}

export function canAccessAllTenants(role) {
  return hasPermission(role, PERMISSIONS.TENANT_READ_ALL);
}

export function getUserPermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

export function canManageUsers(role) {
  return hasPermission(role, PERMISSIONS.USER_CREATE);
}

export function canManageResources(role) {
  return hasAnyPermission(role, [
    PERMISSIONS.WORKER_CREATE,
    PERMISSIONS.DOCUMENT_CREATE,
  ]);
}
