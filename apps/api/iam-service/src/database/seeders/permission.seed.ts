/* eslint-disable turbo/no-undeclared-env-vars */
import { Action, Resource } from '@ecohatch/utils-shared';
import { PrismaClient, Role } from '@prisma/client';

import { logger } from '.';

const data = Object.values(Resource as object).map((resource: string) => ({
  groupName: resource,
  groupSlug: resource.toLowerCase().split(' ').join('-'),
  description: `Permissions for ${resource}`,
  permissions: Object.values(Action).map((action: string) => ({
    name: `${action} ${resource}`,
    slug: `${action.toLowerCase()}-${resource.toLowerCase().split(' ').join('-')}`,
  })),
}));
export const seedPermissions = async (prisma: PrismaClient): Promise<void> => {
  logger.info('🔍 Seeding permissions started...');

  try {
    let groupSortOrder = 0;
    let permissionSortOrder = 0;

    const systemUserAcc = await prisma.userAccount.findUnique({
      where: { email: process.env.SYSTEM_USER_EMAIL!, userType: Role.SYSTEM },
    });
    const systemUserId = systemUserAcc?.id ?? null;

    for (const seed of data) {
      await prisma.$transaction(async (transaction) => {
        const permissionGroup = await transaction.permissionGroup.upsert({
          where: { slug: seed.groupSlug },
          create: {
            name: seed.groupName,
            slug: seed.groupSlug,
            description: seed.description,
            sortOrder: groupSortOrder,
            createdBy: systemUserId,
            updatedBy: systemUserId,
          },
          update: {
            updatedBy: systemUserId,
            sortOrder: groupSortOrder,
          },
        });

        for (const permission of seed.permissions) {
          await transaction.permission.upsert({
            where: { slug: permission.slug },
            create: {
              name: permission.name,
              slug: permission.slug,
              permissionGroupId: permissionGroup.id,
              sortOrder: permissionSortOrder,
              createdBy: systemUserId,
              updatedBy: systemUserId,
            },
            update: {
              updatedBy: systemUserId,
              sortOrder: permissionSortOrder,
            },
          });
          permissionSortOrder++;
        }
        permissionSortOrder = 0;
        groupSortOrder++;
      });
    }
    logger.info('✅ Permission seed completed');
  } catch (error) {
    logger.error('❌ Seeding permissions failed');
    logger.error(error instanceof Error ? error.message : String(error));
  }
};
