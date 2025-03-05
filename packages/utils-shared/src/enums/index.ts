// ############################################ Common ############################################

export enum Role {
  ADMIN = 'admin',
  ADMIN_USER = 'admin_user',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

// ############################################ Storage Service ############################################
export enum StorageEntity {
  AdMINS = 'admins',
  VENDORS = 'vendors',
  CUSTOMERS = 'customers',
  VENDOR_DOCUMENTS = 'vendor-documents',
  CUSTOMER_DOCUMENTS = 'customer-documents',
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  BRANDS = 'brands',
  BANNERS = 'banners',
  BLOG_CATEGORIES = 'blog-categories',
  BLOGS = 'blogs',
  LANGUAGES = 'languages',
  STORE = 'store',
  SITE_MAPS = 'site-maps',
  COUPONS = 'coupons',
  MEDIA_GALLERIES = 'media-galleries',
}

export enum FileStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export enum FileEventStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum FileEventType {
  REFERENCE = 'reference',
  DEREFERENCE = 'dereference',
}
