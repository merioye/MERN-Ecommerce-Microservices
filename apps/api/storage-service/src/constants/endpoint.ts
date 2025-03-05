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
      DeleteFile: '/:file-path',
    },
    Update: {
      ConfirmUpload: '/:file-path/confirm-upload',
    },
  },
} as const;
