import { Inject, Injectable } from '@nestjs/common';
import {
  BadRequestError,
  EntityPrimaryKey,
  HASH_SERVICE,
  IHashService,
  NotFoundError,
} from '@ecohatch/utils-api';
import { Admin, Role } from '@prisma/client';

import { BaseAdminService, PrismaService } from '@/database';

import { IUserAccountService, USER_ACCOUNT_SERVICE } from '../../auth';
import { ADMIN_GROUP_SERVICE } from '../constants';
import { CreateAdminDto } from '../dtos';
import { IAdminGroupService, IAdminService } from '../interfaces';

/**
 * Service for managing admins.
 * Provides methods to create, update, delete, and retrieve admins.
 *
 * @class AdminService
 * @extends {BaseAdminService}
 * @implements {IAdminService}
 */
@Injectable()
export class AdminService extends BaseAdminService implements IAdminService {
  public constructor(
    prismaService: PrismaService,
    @Inject(ADMIN_GROUP_SERVICE)
    private readonly _adminGroupService: IAdminGroupService,
    @Inject(HASH_SERVICE) private readonly _hashService: IHashService,
    @Inject(USER_ACCOUNT_SERVICE)
    private readonly _userAccountService: IUserAccountService
  ) {
    super(prismaService);
  }

  /**
   * Creates a new admin.
   *
   * @param data - The data to create the admin with
   * @returns The created admin
   */
  public async createOne(
    data: CreateAdminDto
  ): Promise<Omit<Admin, 'password'>> {
    const { firstName, lastName, email, adminGroupId, password } = data;
    const existingAdminQuery = this.findOne({
      where: { email },
      withDeleted: true,
    });
    const existingUserAccountQuery = this._userAccountService.findOne({
      where: { email },
    });
    const [existingAdmin, existingUserAccount] = await Promise.all([
      existingAdminQuery,
      existingUserAccountQuery,
    ]);

    if (existingAdmin || existingUserAccount) {
      throw new BadRequestError('admin.error.Admin_already_exists');
    }

    const adminGroup = await this._adminGroupService.findById(
      adminGroupId as unknown as EntityPrimaryKey
    );
    if (!adminGroup) {
      throw new NotFoundError('adminGroup.error.AdminGroup_not_found');
    }

    const hashedPassword = await this._hashService.hash(password);

    return await this.transaction(async (transaction) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...adminWithoutPassword } =
        await transaction.admin.create({
          data: {
            ...data,
            password: hashedPassword,
          },
        });

      await transaction.userAccount.create({
        data: {
          firstName,
          lastName,
          email,
          userType: Role.ADMIN_USER,
          userReferenceId: adminWithoutPassword.id,
        },
      });

      return adminWithoutPassword;
    });
  }
}
