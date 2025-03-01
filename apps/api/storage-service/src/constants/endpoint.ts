export const ENDPOINT = {
  Health: {
    Get: {
      HealthCheck: '/healthcheck',
    },
  },
  Storage: {
    Base: '/files',
    Get: {
      GenerateUploadUrl: '/generate-upload-url',
    },
    Delete: {
      DeleteFile: '/:file-url',
    },
  },
} as const;
