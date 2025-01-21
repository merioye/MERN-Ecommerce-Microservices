export const EndPoint = {
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
    },
    Delete: {
      SoftDeleteAdminGroup: '/:id',
      HardDeleteAdminGroup: '/:id/hard-delete',
    },
  },
} as const;
