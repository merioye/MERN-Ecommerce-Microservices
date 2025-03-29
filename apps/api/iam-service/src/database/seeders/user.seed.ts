/* eslint-disable turbo/no-undeclared-env-vars */
import { CryptoHashService, HashAlgorithm } from '@ecohatch/utils-api';
import { ADMIN, ADMIN_GROUP, Role, SYSTEM_USER } from '@ecohatch/utils-shared';
import { PrismaClient } from '@prisma/client';

import { logger } from '.';

export const seedUsers = async (prisma: PrismaClient): Promise<void> => {
  logger.info('🔍 Seeding users started...');
  const hashService = new CryptoHashService();

  try {
    const adminUserEmail = process.env.ADMIN_USER_EMAIL;
    const adminUserPassword = process.env.ADMIN_USER_PASSWORD;
    const systemUserEmail = process.env.SYSTEM_USER_EMAIL;
    const systemUserPassword = process.env.SYSTEM_USER_PASSWORD;
    if (
      !adminUserEmail ||
      !adminUserPassword ||
      !systemUserEmail ||
      !systemUserPassword
    ) {
      throw new Error('❌ User email or password is missing in users seed');
    }

    // Seed application default users
    await prisma.$transaction(async (transaction) => {
      const createdAdminGroup = await transaction.adminGroup.upsert({
        where: {
          slug: ADMIN_GROUP.slug,
        },
        create: {
          ...ADMIN_GROUP,
        },
        update: {
          slug: ADMIN_GROUP.slug,
        },
      });

      // Create system user
      const createdSystemUser = await transaction.admin.upsert({
        where: {
          email: systemUserEmail,
        },
        create: {
          firstName: SYSTEM_USER.firstName,
          lastName: SYSTEM_USER.lastName,
          email: systemUserEmail,
          password: await hashService.hash(systemUserPassword, {
            algorithm: HashAlgorithm.SHA256,
          }),
          adminGroupId: createdAdminGroup.id,
        },
        update: {
          email: systemUserEmail,
        },
      });

      const createdSystemAccount = await transaction.userAccount.upsert({
        where: {
          email: systemUserEmail,
        },
        create: {
          firstName: SYSTEM_USER.firstName,
          lastName: SYSTEM_USER.lastName,
          email: systemUserEmail,
          userReferenceId: createdSystemUser.id,
          userType: Role.SYSTEM,
        },
        update: {
          email: systemUserEmail,
        },
      });

      // Create super admin user
      const createdAdmin = await transaction.admin.upsert({
        where: {
          email: adminUserEmail,
        },
        create: {
          isAdmin: ADMIN.isAdmin,
          firstName: ADMIN.firstName,
          lastName: ADMIN.lastName,
          email: adminUserEmail,
          password: await hashService.hash(adminUserPassword, {
            algorithm: HashAlgorithm.SHA256,
          }),
          adminGroupId: createdAdminGroup.id,
          createdBy: createdSystemAccount.id,
          updatedBy: createdSystemAccount.id,
        },
        update: {
          updatedBy: createdSystemAccount.id,
        },
      });

      await transaction.userAccount.upsert({
        where: {
          email: adminUserEmail,
        },
        create: {
          firstName: ADMIN.firstName,
          lastName: ADMIN.lastName,
          email: adminUserEmail,
          userReferenceId: createdAdmin.id,
          userType: Role.ADMIN,
        },
        update: {
          email: adminUserEmail,
        },
      });

      await transaction.adminGroup.update({
        where: { id: createdAdminGroup.id },
        data: {
          createdBy: createdSystemAccount.id,
          updatedBy: createdSystemAccount.id,
        },
      });
    });

    logger.info('✅ User seed completed');
  } catch (error) {
    logger.error('❌ Seeding users failed');
    logger.error(error instanceof Error ? error.message : String(error));
  }
};
