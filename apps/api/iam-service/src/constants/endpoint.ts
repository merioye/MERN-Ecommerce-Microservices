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
  },
} as const;
