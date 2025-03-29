export const ENDPOINT = {
  Health: {
    Get: {
      HealthCheck: '/healthcheck',
    },
  },
  AdminGroup: {
    Base: '/admin-groups',
    Post: {
      CreateAdminGroup: '/',
    },
    Patch: {
      UpdateAdminGroup: '/:id',
      RestoreAdminGroup: '/:id/restore',
    },
    Delete: {
      SoftDeleteAdminGroup: '/:id',
      HardDeleteAdminGroup: '/:id/hard-delete',
    },
    Get: {
      GetAdminGroupList: '/',
      GetAdminGroupBySlug: '/:slug',
    },
  },
  Admin: {
    Base: '/admins',
    Post: {
      CreateAdmin: '/',
    },
  },
  Permission: {
    Base: '/permissions',
    Get: {
      GetPermissionList: '/',
      GetPermissionGroupList: '/groups',
      GetAdminPermissions: '/admins/:adminId',
      GetAdminGroupPermissions: '/admin-groups/:adminGroupId',
    },
    Post: {
      AssignPermissionsToAdmin: '/admins/assign',
      AssignPermissionsToAdminGroup: '/admin-groups/assign',
    },
    Delete: {
      RevokePermissionFromAdmin: '/admins/:adminId/:permissionId',
      RevokePermissionFromAdminGroup:
        '/admin-groups/:adminGroupId/:permissionId',
    },
  },
  Auth: {
    Base: '/auth',
    Post: {
      LoginAdmin: '/login/admin',
      Refresh: '/refresh',
      Logout: '/logout',
      LogoutAll: '/logout-all',
      LogoutDevice: '/logout-device/:deviceId',
    },
    Get: {
      Self: '/self',
      LoggedInDevices: '/logged-in-devices',
    },
  },
} as const;
