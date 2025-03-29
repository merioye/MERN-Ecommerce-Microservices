export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TBaseUser = {
  firstName: string;
  lastName: string;
  email: string;
  profileUrl: string | null;
  profileId: string | null;
  phoneNumber: string | null;
  mfaEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TAdmin = TBaseUser & {
  id: number;
  address: string | null;
  isAdmin: boolean;
  deletedAt: Date | null;
  isDeleted: boolean;
  adminGroupId: number;
  createdBy: number | null;
  updatedBy: number | null;
  deletedBy: number | null;
};

export type TPermission = {
  id: number;
  permissionGroupId: number;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number | null;
  updatedBy: number | null;
};

export type TUser = TAdmin & {
  permissions: TPermission[];
};

export type TSelf = TUser | null;
