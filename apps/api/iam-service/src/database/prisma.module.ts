import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * The `PrismaModule` is a global module that provides and exports the `PrismaService`.
 * This module is decorated with `@Global`, making it available throughout the application
 * without needing to import it in each module.
 *
 * @module PrismaModule
 * @global
 * @provider {PrismaService} Provides the PrismaService for database interactions.
 * @export {PrismaService} Exports the PrismaService to be used in other modules.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
