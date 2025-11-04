import { driveService } from "./drivers/services";
import { MIME_TYPES } from './types/index';

// ============================================
// FILE OPERATIONS
// ============================================

/**
 * Upload a file to Google Drive
 * @param filePath - Path to local file (e.g., './document.pdf')
 * @param options - Optional: fileName, folderId
 */
export async function uploadFile(
  filePath: string,
  options?: {
    fileName?: string;
    folderId?: string;
    description?: string;
  }
) {
  return await driveService.uploadFile(filePath, {
    name: options?.fileName,
    parents: options?.folderId ? [options.folderId] : undefined,
    description: options?.description
  });
}

/**
 * Download a file from Google Drive
 * @param fileId - Google Drive file ID
 * @param savePath - Where to save the file (e.g., './downloads/file.pdf')
 */
export async function downloadFile(fileId: string, savePath: string) {
  return await driveService.downloadFile(fileId, savePath);
}

/**
 * Delete a file from Google Drive
 * @param fileId - Google Drive file ID
 */
export async function deleteFile(fileId: string) {
  return await driveService.deleteFile(fileId);
}

/**
 * Rename a file
 * @param fileId - Google Drive file ID
 * @param newName - New name for the file
 */
export async function renameFile(fileId: string, newName: string) {
  return await driveService.updateFileMetadata(fileId, { name: newName });
}

/**
 * Update file content (replace existing file content)
 * @param fileId - Google Drive file ID
 * @param newFilePath - Path to new content file
 */
export async function updateFile(fileId: string, newFilePath: string) {
  return await driveService.updateFileContent(fileId, newFilePath);
}

/**
 * Get file information
 * @param fileId - Google Drive file ID
 */
export async function getFileInfo(fileId: string) {
  return await driveService.getFileMetadata(fileId);
}

/**
 * Move file to a different folder
 * @param fileId - Google Drive file ID
 * @param newFolderId - Destination folder ID
 */

export async function moveFile(fileId: string, newFolderId: string) {
  const file = await driveService.getFileMetadata(fileId);
  if (!file.success || !file.data) {
    return { success: false, error: 'File not found' };
  }

  return await driveService.updateFileMetadata(fileId, { parents: [newFolderId] });
}

export async function moveFileByName(
  fileName: string, 
  folderName: string
){
  // Resolve file ID by name
  const fileResult = await getFileIdByName(fileName);
  if (!fileResult.success || !fileResult.fileId) {
    return { success: false, error: 'File not found' };
  }

  // Resolve folder ID by name
  const folderResult = await getFolderIdByName(folderName);
  if (!folderResult.success || !folderResult.folderId) {
    return { success: false, error: 'Destination folder not found' };
  }

  // Move using resolved IDs
  return await moveFile(fileResult.fileId, folderResult.folderId);
}

/**
 * Copy a file
 * @param fileId - Google Drive file ID
 * @param newName - Optional: Name for the copy
 */
export async function copyFile(fileId: string, newName?: string) {
  // TODO: Implement copyFile in driveService or use a general API call method
  return await (driveService as any).copyFile(fileId, newName ? { name: newName } : undefined);
}

// ============================================
// FOLDER OPERATIONS
// ============================================

/**
 * Create a new folder
 * @param folderName - Name of the folder
 * @param parentFolderId - Optional: Parent folder ID (creates in root if not specified)
 */
export async function createFolder(folderName: string, parentFolderId?: string) {
  return await driveService.createFolder(folderName, parentFolderId);
}

/**
 * Delete a folder
 * @param folderId - Google Drive folder ID
 */
export async function deleteFolder(folderId: string) {
  return await driveService.deleteFile(folderId);
}

/**
 * List all folders
 */
export async function listAllFolders() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.FOLDER}' and trashed=false`
  });
}

/**
 * List files in a specific folder
 * @param folderId - Google Drive folder ID
 */
export async function listFilesInFolder(folderId: string) {
  return await driveService.listFiles({
    query: `'${folderId}' in parents and trashed=false`
  });
}

// ============================================
// SEARCH OPERATIONS
// ============================================

/**
 * Search files by name
 * @param fileName - Name or partial name to search
 */
export async function searchByName(fileName: string) {
  return await driveService.listFiles({
    query: `name contains '${fileName}' and trashed=false`
  });
}

/**
 * Search files by exact name
 * @param fileName - Exact file name
 */
export async function searchByExactName(fileName: string) {
  return await driveService.listFiles({
    query: `name='${fileName}' and trashed=false`
  });
}

/**
 * Search by file type
 * @param type - 'pdf', 'image', 'document', 'spreadsheet', 'folder', or custom mime type
 */
export async function searchByType(type: string) {
  const mimeTypes: Record<string, string> = {
    pdf: MIME_TYPES.PDF,
    image: 'image/',
    document: MIME_TYPES.DOCUMENT,
    spreadsheet: MIME_TYPES.SPREADSHEET,
    presentation: MIME_TYPES.PRESENTATION,
    folder: MIME_TYPES.FOLDER
  };

  const mimeType = mimeTypes[type.toLowerCase()] || type;
  const query = mimeType.endsWith('/')
    ? `mimeType contains '${mimeType}' and trashed=false`
    : `mimeType='${mimeType}' and trashed=false`;

  return await driveService.listFiles({ query });
}

/**
 * Search files modified after a date
 * @param date - Date string (e.g., '2024-01-01' or '2024-01-01T10:00:00')
 */
export async function searchModifiedAfter(date: string) {
  const isoDate = date.includes('T') ? date : `${date}T00:00:00`;
  return await driveService.listFiles({
    query: `modifiedTime > '${isoDate}' and trashed=false`,
    orderBy: 'modifiedTime desc'
  });
}

/**
 * Search starred files
 */
export async function searchStarredFiles() {
  return await driveService.listFiles({
    query: 'starred=true and trashed=false'
  });
}

/**
 * Search shared files
 */
export async function searchSharedFiles() {
  return await driveService.listFiles({
    query: 'sharedWithMe=true and trashed=false'
  });
}

/**
 * Search files containing text
 * @param searchText - Text to search for in file content
 */
export async function searchByContent(searchText: string) {
  return await driveService.listFiles({
    query: `fullText contains '${searchText}' and trashed=false`
  });
}

// ============================================
// LIST OPERATIONS
// ============================================

/**
 * List all files (paginated, default 10 files)
 * @param limit - Number of files to return (default: 10)
 */
export async function listFiles(limit: number = 10) {
  return await driveService.listFiles({
    pageSize: limit,
    query: 'trashed=false'
  });
}

/**
 * List recent files (modified in last N days)
 * @param days - Number of days to look back (default: 7)
 */
export async function listRecentFiles(days: number = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const isoDate = date.toISOString();

  return await driveService.listFiles({
    query: `modifiedTime > '${isoDate}' and trashed=false`,
    orderBy: 'modifiedTime desc',
    pageSize: 20
  });
}

/**
 * List all PDFs
 */
export async function listPDFs() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.PDF}' and trashed=false`
  });
}

/**
 * List all images
 */
export async function listImages() {
  return await driveService.listFiles({
    query: `mimeType contains 'image/' and trashed=false`
  });
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Upload multiple files at once
 * @param filePaths - Array of file paths to upload
 * @param folderId - Optional: Upload to specific folder
 */
export async function uploadMultipleFiles(
  filePaths: string[],
  folderId?: string
) {
  const results = [];
  for (const filePath of filePaths) {
    const result = await uploadFile(filePath, { folderId });
    results.push({ filePath, result });
  }
  return results;
}

/**
 * Delete multiple files at once
 * @param fileIds - Array of file IDs to delete
 */
export async function deleteMultipleFiles(fileIds: string[]) {
  const results = [];
  for (const fileId of fileIds) {
    const result = await deleteFile(fileId);
    results.push({ fileId, result });
  }
  return results;
}

/**
 * Download multiple files at once
 * @param downloads - Array of {fileId, savePath} objects
 */
export async function downloadMultipleFiles(
  downloads: Array<{ fileId: string; savePath: string }>
) {
  const results = [];
  for (const { fileId, savePath } of downloads) {
    const result = await downloadFile(fileId, savePath);
    results.push({ fileId, savePath, result });
  }
  return results;
}

// ============================================
// UTILITY OPERATIONS
// ============================================

/**
 * Check if file exists by name
 * @param fileName - File name to check
 */
export async function fileExists(fileName: string): Promise<boolean> {
  const result = await searchByExactName(fileName);
  return result.success && (result.data?.files.length || 0) > 0;
}

/**
 * Get folder ID by name
 * @param folderName - Folder name to find
 */
export async function getFolderIdByName(folderName: string) {
  const result = await driveService.listFiles({
    query: `name='${folderName}' and mimeType='${MIME_TYPES.FOLDER}' and trashed=false`,
    pageSize: 1
  });

  if (result.success && result.data?.files.length) {
    return {
      success: true,
      folderId: result.data.files[0]?.id || '',
      folder: result.data.files[0]
    };
  }

  return { success: false, error: 'Folder not found' };
}

/**
 * Get file ID by name
 * @param fileName - File name to find
 */
export async function getFileIdByName(fileName: string) {
  const result = await searchByExactName(fileName);

  if (result.success && result.data?.files.length) {
    return {
      success: true,
      fileId: result.data.files[0]?.id || '',
      file: result.data.files[0]
    };
  }

  return { success: false, error: 'File not found' };
}

// ============================================
// Export all operations
// ============================================

export const driveOperations = {
  // File operations
  uploadFile,
  downloadFile,
  deleteFile,
  renameFile,
  updateFile,
  getFileInfo,
  moveFile,
  moveFileByName,
  copyFile,

  // Folder operations
  createFolder,
  deleteFolder,
  listAllFolders,
  listFilesInFolder,

  // Search operations
  searchByName,
  searchByExactName,
  searchByType,
  searchModifiedAfter,
  searchStarredFiles,
  searchSharedFiles,
  searchByContent,

  // List operations
  listFiles,
  listRecentFiles,
  listPDFs,
  listImages,

  // Batch operations
  uploadMultipleFiles,
  deleteMultipleFiles,
  downloadMultipleFiles,

  // Utility operations
  fileExists,
  getFolderIdByName,
  getFileIdByName
};