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
} as const;
