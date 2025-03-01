import { StorageEntity } from '../enums';

const allowedImageTypes = ['image/jpg', 'image/jpeg', 'image/png'];
const allowedDocumentTypes = [
  'application/pdf', // PDF
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.ms-excel', // XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'text/csv', // CSV
];
export const allowedFileTypes = new Map<StorageEntity, string[]>([
  [StorageEntity.AdMINS, allowedImageTypes],
  [StorageEntity.VENDORS, allowedImageTypes],
  [StorageEntity.CUSTOMERS, allowedImageTypes],
  [StorageEntity.VENDOR_DOCUMENTS, allowedDocumentTypes],
  [StorageEntity.CUSTOMER_DOCUMENTS, allowedDocumentTypes],
  [StorageEntity.PRODUCTS, allowedImageTypes],
  [StorageEntity.CATEGORIES, allowedImageTypes],
  [StorageEntity.BRANDS, allowedImageTypes],
  [StorageEntity.BANNERS, allowedImageTypes],
  [StorageEntity.BLOG_CATEGORIES, allowedImageTypes],
  [StorageEntity.BLOGS, allowedImageTypes],
  [StorageEntity.LANGUAGES, allowedImageTypes],
  [StorageEntity.STORE, allowedImageTypes],
  [StorageEntity.SITE_MAPS, allowedImageTypes],
  [StorageEntity.COUPONS, allowedImageTypes],
  [
    StorageEntity.MEDIA_GALLERIES,
    [...allowedImageTypes, ...allowedDocumentTypes],
  ],
]);

export const PAGINATION = {
  DEFAULT_PAGINATION_PAGE: 1,
  DEFAULT_PAGINATION_LIMIT: 10,
  MIN_PAGINATION_LIMIT: 1,
  MAX_PAGINATION_LIMIT: 100,
  MIN_PAGINATION_PAGE: 1,
};
