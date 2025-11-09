// ============================================
// Authentication & Credentials Types
// ============================================

import { MIME_TYPES } from "../const";

export interface GoogleCredentials {
  web?: WebCredentials;
  installed?: InstalledCredentials;
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
}

export interface WebCredentials {
  client_id: string;
  project_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_secret: string;
  redirect_uris: string[];
  javascript_origins?: string[];
}

export interface InstalledCredentials {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  auth_uri?: string;
  token_uri?: string;
}

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
  id_token?: string;
}

export interface CredentialsFileParams {
  clientid: string;
  projectid: string;
  clientsecret: string;
  redirecturis?: string[];
  javascript_origin?: string[];
}

// ============================================
// File Metadata Types
// ============================================

export interface FileMetadata {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  starred?: boolean;
  trashed?: boolean;
  explicitlyTrashed?: boolean;
  parents?: string[];
  properties?: Record<string, string>;
  appProperties?: Record<string, string>;
  spaces?: string[];
  version?: string;
  webContentLink?: string;
  webViewLink?: string;
  iconLink?: string;
  hasThumbnail?: boolean;
  thumbnailLink?: string;
  thumbnailVersion?: string;
  viewedByMe?: boolean;
  viewedByMeTime?: string;
  createdTime?: string;
  modifiedTime?: string;
  modifiedByMeTime?: string;
  modifiedByMe?: boolean;
  sharedWithMeTime?: string;
  sharingUser?: User;
  owners?: User[];
  teamDriveId?: string;
  driveId?: string;
  lastModifyingUser?: User;
  shared?: boolean;
  ownedByMe?: boolean;
  capabilities?: FileCapabilities;
  viewersCanCopyContent?: boolean;
  copyRequiresWriterPermission?: boolean;
  writersCanShare?: boolean;
  permissions?: Permission[];
  permissionIds?: string[];
  hasAugmentedPermissions?: boolean;
  folderColorRgb?: string;
  originalFilename?: string;
  fullFileExtension?: string;
  fileExtension?: string;
  md5Checksum?: string;
  size?: string;
  quotaBytesUsed?: string;
  headRevisionId?: string;
  contentHints?: ContentHints;
  imageMediaMetadata?: ImageMediaMetadata;
  videoMediaMetadata?: VideoMediaMetadata;
  isAppAuthorized?: boolean;
  exportLinks?: Record<string, string>;
  shortcutDetails?: ShortcutDetails;
  contentRestrictions?: ContentRestriction[];
  resourceKey?: string;
  linkShareMetadata?: LinkShareMetadata;
  labelInfo?: LabelInfo;
  sha1Checksum?: string;
  sha256Checksum?: string;
}

export interface User {
  displayName?: string;
  kind?: string;
  me?: boolean;
  permissionId?: string;
  emailAddress?: string;
  photoLink?: string;
}

export interface FileCapabilities {
  canAcceptOwnership?: boolean;
  canAddChildren?: boolean;
  canAddFolderFromAnotherDrive?: boolean;
  canAddMyDriveParent?: boolean;
  canChangeCopyRequiresWriterPermission?: boolean;
  canChangeSecurityUpdateEnabled?: boolean;
  canChangeViewersCanCopyContent?: boolean;
  canComment?: boolean;
  canCopy?: boolean;
  canDelete?: boolean;
  canDeleteChildren?: boolean;
  canDownload?: boolean;
  canEdit?: boolean;
  canListChildren?: boolean;
  canModifyContent?: boolean;
  canModifyContentRestriction?: boolean;
  canModifyLabels?: boolean;
  canMoveChildrenOutOfDrive?: boolean;
  canMoveChildrenOutOfTeamDrive?: boolean;
  canMoveChildrenWithinDrive?: boolean;
  canMoveChildrenWithinTeamDrive?: boolean;
  canMoveItemIntoTeamDrive?: boolean;
  canMoveItemOutOfDrive?: boolean;
  canMoveItemOutOfTeamDrive?: boolean;
  canMoveItemWithinDrive?: boolean;
  canMoveItemWithinTeamDrive?: boolean;
  canMoveTeamDriveItem?: boolean;
  canReadDrive?: boolean;
  canReadLabels?: boolean;
  canReadRevisions?: boolean;
  canReadTeamDrive?: boolean;
  canRemoveChildren?: boolean;
  canRemoveMyDriveParent?: boolean;
  canRename?: boolean;
  canShare?: boolean;
  canTrash?: boolean;
  canTrashChildren?: boolean;
  canUntrash?: boolean;
}

export interface Permission {
  id?: string;
  type?: 'user' | 'group' | 'domain' | 'anyone';
  emailAddress?: string;
  domain?: string;
  role?: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  displayName?: string;
  photoLink?: string;
  expirationTime?: string;
  deleted?: boolean;
  permissionDetails?: PermissionDetail[];
}

export interface PermissionDetail {
  permissionType?: string;
  role?: string;
  inheritedFrom?: string;
  inherited?: boolean;
}

export interface ContentHints {
  thumbnail?: {
    image?: string;
    mimeType?: string;
  };
  indexableText?: string;
}

export interface ImageMediaMetadata {
  width?: number;
  height?: number;
  rotation?: number;
  location?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  time?: string;
  cameraMake?: string;
  cameraModel?: string;
  exposureTime?: number;
  aperture?: number;
  flashUsed?: boolean;
  focalLength?: number;
  isoSpeed?: number;
  meteringMode?: string;
  sensor?: string;
  exposureMode?: string;
  colorSpace?: string;
  whiteBalance?: string;
  exposureBias?: number;
  maxApertureValue?: number;
  subjectDistance?: number;
  lens?: string;
}

export interface VideoMediaMetadata {
  width?: number;
  height?: number;
  durationMillis?: string;
}

export interface StorageQuota {
  usage?: string;
  limit?: string;
}

export interface ShortcutDetails {
  targetId?: string;
  targetMimeType?: string;
  targetResourceKey?: string;
}

export interface ContentRestriction {
  readOnly?: boolean;
  reason?: string;
  restrictingUser?: User;
  restrictionTime?: string;
  type?: string;
}

export interface LinkShareMetadata {
  securityUpdateEligible?: boolean;
  securityUpdateEnabled?: boolean;
}

export interface LabelInfo {
  labels?: Label[];
}

export interface Label {
  id?: string;
  revisionId?: string;
  kind?: string;
  fields?: Record<string, LabelField>;
}

export interface LabelField {
  id?: string;
  valueType?: string;
  dateString?: string[];
  integer?: string[];
  selection?: string[];
  text?: string[];
  user?: User[];
}

// ============================================
// List Files Parameters
// ============================================

export interface ListFilesParams {
  /** Maximum number of files to return per page (1-1000) */
  pageSize?: number;
  
  /** Query string for filtering files
   * Examples:
   * - "name contains 'report'"
   * - "mimeType='application/pdf'"
   * - "trashed=false"
   * - "'folder_id' in parents"
   */
  query?: string;
  
  /** Order results by field
   * Options: 'createdTime', 'folder', 'modifiedByMeTime', 'modifiedTime', 
   * 'name', 'name_natural', 'quotaBytesUsed', 'recency', 'sharedWithMeTime', 
   * 'starred', 'viewedByMeTime'
   * Add 'desc' for descending: 'modifiedTime desc'
   */
  orderBy?: string;
  
  /** Token for the next page of results */
  pageToken?: string;
  
  /** Comma-separated list of spaces to query (drive, appDataFolder, photos) */
  spaces?: string;
  
  /** Whether to include items from all drives (Shared Drives) */
  includeItemsFromAllDrives?: boolean;
  
  /** Whether Team Drive items should be included in results */
  includeTeamDriveItems?: boolean;
  
  /** Deprecated: Use includeItemsFromAllDrives */
  supportsAllDrives?: boolean;
  
  /** Deprecated: Use includeItemsFromAllDrives */
  supportsTeamDrives?: boolean;
  
  /** ID of the shared drive to search */
  driveId?: string;
  
  /** Deprecated: Use driveId */
  teamDriveId?: string;
  
  /** Selector specifying which fields to include in response */
  fields?: string;
  
  /** Whether the requesting application supports both My Drives and shared drives */
  corpora?: 'user' | 'domain' | 'drive' | 'allDrives';
  
  /** Deprecated: Use corpora */
  corpus?: 'domain' | 'user';
  
  /** Whether to include permissions for shared drive items */
  includePermissionsForView?: string;
}

// ============================================
// Upload File Parameters
// ============================================

export interface UploadFileParams {
  /** Path to the local file to upload */
  filePath: string;
  
  /** Metadata for the file */
  metadata?: UploadFileMetadata;
  
  /** Media metadata */
  media?: {
    mimeType?: string;
    body?: any;
  };
}

export interface UploadFileMetadata {
  /** Name of the file */
  name?: string;
  
  /** MIME type of the file */
  mimeType?: string;
  
  /** Parent folder IDs */
  parents?: string[];
  
  /** Description of the file */
  description?: string;
  
  /** Whether the file is starred */
  starred?: boolean;
  
  /** Custom file properties (visible to all apps) */
  properties?: Record<string, string>;
  
  /** Private properties (visible only to the requesting app) */
  appProperties?: Record<string, string>;
  
  /** Folder color (RGB hex: #RRGGBB) */
  folderColorRgb?: string;
  
  /** Content hints */
  contentHints?: ContentHints;
  
  /** Modified time (RFC 3339 date-time) */
  modifiedTime?: string;
  
  /** Created time (RFC 3339 date-time) */
  createdTime?: string;
  
  /** Whether viewers can copy content */
  viewersCanCopyContent?: boolean;
  
  /** Whether writers can share */
  writersCanShare?: boolean;
  
  /** Whether copy requires writer permission */
  copyRequiresWriterPermission?: boolean;
}

// ============================================
// Download File Parameters
// ============================================

export interface DownloadFileParams {
  /** Google Drive file ID */
  fileId: string;
  
  /** Local destination path */
  destPath: string;
  
  /** Whether to acknowledge abuse risk (for flagged files) */
  acknowledgeAbuse?: boolean;
  
  /** Whether the requesting application supports shared drives */
  supportsAllDrives?: boolean;
  
  /** Whether to include permissions */
  includePermissionsForView?: string;
}

// ============================================
// Update File Parameters
// ============================================

export interface UpdateFileContentParams {
  /** Google Drive file ID */
  fileId: string;
  
  /** Path to the new content file */
  filePath: string;
  
  /** Media metadata */
  media?: {
    mimeType?: string;
  };
  
  /** Whether to set the modified date to the upload time */
  keepRevisionForever?: boolean;
  
  /** Whether to use content as indexable text */
  useContentAsIndexableText?: boolean;
  
  /** OCR language (for image files) */
  ocrLanguage?: string;
  
  /** Whether the requesting application supports shared drives */
  supportsAllDrives?: boolean;
}

export interface UpdateFileMetadataParams {
  /** Google Drive file ID */
  fileId: string;
  
  /** Updated metadata */
  metadata: Partial<FileMetadata>;
  
  /** Comma-separated list of parent IDs to add */
  addParents?: string;
  
  /** Comma-separated list of parent IDs to remove */
  removeParents?: string;
  
  /** Whether the requesting application supports shared drives */
  supportsAllDrives?: boolean;
  
  /** Whether to keep file revision forever */
  keepRevisionForever?: boolean;
  
  /** Whether to use content as indexable text */
  useContentAsIndexableText?: boolean;
  
  /** OCR language */
  ocrLanguage?: string;
  
  /** Selector specifying which fields to include in response */
  fields?: string;
}

// ============================================
// Delete File Parameters
// ============================================

export interface DeleteFileParams {
  /** Google Drive file ID */
  fileId: string;
  
  /** Whether the requesting application supports shared drives */
  supportsAllDrives?: boolean;
  
  /** Whether Team Drive items should be included */
  supportsTeamDrives?: boolean;
}

// ============================================
// Create Folder Parameters
// ============================================

export interface CreateFolderParams {
  /** Name of the folder */
  folderName: string;
  
  /** Parent folder ID */
  parentFolderId?: string;
  
  /** Additional metadata */
  metadata?: Omit<UploadFileMetadata, 'mimeType'>;
  
  /** Whether the requesting application supports shared drives */
  supportsAllDrives?: boolean;
}

// ============================================
// Get File Metadata Parameters
// ============================================

export interface GetFileMetadataParams {
  /** Google Drive file ID */
  fileId: string;
  
  /** Whether to acknowledge abuse risk */
  acknowledgeAbuse?: boolean;
  
  /** Selector specifying which fields to include
   * Examples: 'id, name, mimeType, size, createdTime'
   */
  fields?: string;
  
  /** Whether to include permissions for shared drive items */
  includePermissionsForView?: string;
  
  /** Whether the requesting application supports shared drives */
  supportsAllDrives?: boolean;
  
  /** Whether Team Drive items should be included */
  supportsTeamDrives?: boolean;
}

// ============================================
// Search Files Parameters
// ============================================

export interface SearchFilesParams extends ListFilesParams {
  /** Search query string
   * Common queries:
   * - "name contains 'keyword'"
   * - "mimeType='image/jpeg'"
   * - "fullText contains 'important'"
   * - "modifiedTime > '2023-01-01T00:00:00'"
   * - "'me' in owners"
   * - "trashed=false and starred=true"
   */
  query: string;
}

// ============================================
// Copy File Parameters
// ============================================

export interface CopyFileParams {
  /** Source file ID to copy */
  fileId: string;
  
  /** Metadata for the copied file */
  metadata?: Partial<FileMetadata>;
  
  /** Whether to ignore the domain's default visibility settings */
  ignoreDefaultVisibility?: boolean;
  
  /** Whether to keep revision forever */
  keepRevisionForever?: boolean;
  
  /** OCR language for image files */
  ocrLanguage?: string;
  
  /** Whether the requesting application supports shared drives */
  supportsAllDrives?: boolean;
  
  /** Selector specifying which fields to include in response */
  fields?: string;
}

// ============================================
// Move File Parameters
// ============================================

export interface MoveFileParams {
  /** File ID to move */
  fileId: string;
  
  /** Comma-separated list of parent IDs to add */
  addParents?: string;
  
  /** Comma-separated list of parent IDs to remove */
  removeParents?: string;
  
  /** Whether the requesting application supports shared drives */
  supportsAllDrives?: boolean;
  
  /** Selector specifying which fields to include in response */
  fields?: string;
}

// ============================================
// Share File Parameters (Permissions)
// ============================================

export interface ShareFileParams {
  /** File ID to share */
  fileId: string;
  
  /** Permission details */
  permission: CreatePermissionParams;
  
  /** Whether to send notification emails */
  sendNotificationEmail?: boolean;
  
  /** Custom message to include in notification email */
  emailMessage?: string;
  
  /** Whether the requesting application supports shared drives */
  supportsAllDrives?: boolean;
  
  /** Whether to transfer ownership */
  transferOwnership?: boolean;
  
  /** Whether to move to new owner's Drive */
  moveToNewOwnersRoot?: boolean;
}

export interface CreatePermissionParams {
  /** Type of grantee */
  type: 'user' | 'group' | 'domain' | 'anyone';
  
  /** Role granted */
  role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  
  /** Email address (for user/group types) */
  emailAddress?: string;
  
  /** Domain name (for domain type) */
  domain?: string;
  
  /** Whether to allow file discovery */
  allowFileDiscovery?: boolean;
  
  /** Expiration time (RFC 3339 date-time) */
  expirationTime?: string;
}

// ============================================
// Export File Parameters
// ============================================

export interface ExportFileParams {
  /** File ID to export */
  fileId: string;
  
  /** MIME type to export to
   * Google Docs: 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
   * Google Sheets: 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
   * Google Slides: 'application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
   */
  mimeType: string;
  
  /** Local destination path */
  destPath: string;
}

// ============================================
// Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  errorDetails?: any;
}

export interface ListFilesResponse {
  files: FileMetadata[];
  nextPageToken?: string;
  incompleteSearch?: boolean;
}

export interface UploadFileResponse {
  file: FileMetadata;
}

export interface DownloadFileResponse {
  path: string;
  size?: number;
}

export interface DeleteFileResponse {
  message: string;
  fileId: string;
}

export interface CreateFolderResponse {
  folder: FileMetadata;
}

// ============================================
// Query Builder Types
// ============================================

export type QueryOperator = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'contains' | 'in' | 'has';

export type QueryField = 
  | 'name'
  | 'fullText'
  | 'mimeType'
  | 'modifiedTime'
  | 'viewedByMeTime'
  | 'trashed'
  | 'starred'
  | 'parents'
  | 'owners'
  | 'writers'
  | 'readers'
  | 'sharedWithMe'
  | 'createdTime'
  | 'properties'
  | 'appProperties'
  | 'visibility'
  | 'shortcutDetails.targetId';

// ============================================
// Batch Operation Types
// ============================================

export interface BatchDeleteParams {
  /** Array of file IDs to delete */
  fileIds: string[];
  
  /** Whether to continue on error */
  continueOnError?: boolean;
}

export interface BatchDownloadParams {
  /** Array of file IDs to download */
  fileIds: string[];
  
  /** Destination directory */
  destDir: string;
  
  /** Whether to continue on error */
  continueOnError?: boolean;
}

// ============================================
// Common MIME Types
// ============================================


export type MimeType = typeof MIME_TYPES[keyof typeof MIME_TYPES]