import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

import { Config } from '@/enums';
import { APP_NAME } from '@/constants';

/**
 * Creates swagger configuration
 *
 * @param {number} PORT - Port which swagger will be served on
 * @returns {Omit<OpenAPIObject, 'paths'>} - Swagger configuration
 */
export const buildSwaggerConfig = (
  PORT: number
): Omit<OpenAPIObject, 'paths'> => {
  const config = new DocumentBuilder()
    .setTitle(APP_NAME?.replaceAll('-', ' '))
    .setDescription(process.env[Config.NPM_PACKAGE_DESCRIPTION]!)
    .setVersion(process.env[Config.NPM_PACKAGE_VERSION]!)
    .addServer(`http://localhost:${PORT}`, 'Local Server')
    .build();

  return config;
};
