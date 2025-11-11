import { MIME_TYPES } from "./const";
import { GoogleDriveService } from "./drivers/GoogleDriveService";
import { driveService } from "./drivers/services";
import { FileMetadata, MimeType } from "./types/index";

// ============================================
// HELPER FUNCTIONS
// ============================================

/** ----------------  SearchByNameHelper ---------------- **/

/**
 * Generic helper to search for items by name with optional type filtering
 * @param name - Name to search for
 * @param type - Optional: 'file' | 'folder' | 'exact' | 'contains'
 * @param searchType - Optional: 'exact' | 'contains' (default: 'exact')
 */
async function searchByNameHelper(
  name: string,
  type?: "file" | "folder",
  searchType: "exact" | "contains" = "exact"
) {
  let query =
    searchType === "exact" ? `name='${name}'` : `name contains '${name}'`;

  if (type === "folder") {
    query += ` and mimeType='${MIME_TYPES.FOLDER}'`;
  } else if (type === "file") {
    query += ` and mimeType!='${MIME_TYPES.FOLDER}'`;
  }

  query += " and trashed=false";

  return await driveService.listFiles({ query });
}

/** ----------------  GetIdByNameHelper ---------------- **/

/**
 * Generic helper to get ID by name with optional type filtering
 * @param name - Name to search for
 * @param type - Optional: 'file' | 'folder'
 */
async function getIdByNameHelper(
  name: string,
  type?: "file" | "folder"
): Promise<{ success: boolean; id?: string; item?: any; error?: string }> {
  const result = await searchByNameHelper(name, type, "exact");

  if (result.success && result.data?.files.length) {
    const item = result.data.files[0];
    return {
      success: true,
      id: item.id,
      item,
    };
  }

  return {
    success: false,
    error: `${
      type ? type.charAt(0).toUpperCase() + type.slice(1) : "Item"
    } not found`,
  };
}

// ============================================
// FILE OPERATIONS
// ============================================

/** ----------------  ReadFileData ---------------- **/

/**
 * Read file content from Google Drive
 * @param fileId - Google Drive file ID
 */
export async function readFileData(fileId: string): Promise<string> {
  const response = await driveService.readFileData(fileId);
  if (response.success && response.data) {
    return typeof response.data === "string"
      ? response.data
      : response.data.toString();
  }
  throw new Error(response.error || "Failed to read file data");
}

/** ----------------  Upload a file ---------------- **/

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
    mimeType?: MimeType;
  }
) {
  return await driveService.uploadFile(filePath, {
    name: options?.fileName,
    parents: options?.folderId ? [options.folderId] : undefined,
    description: options?.description,
    mimeType: options?.mimeType,
  });
}
/** ----------------  Download a file ---------------- **/

/**
 * Download a file from Google Drive
 * @param fileId - Google Drive file ID
 * @param savePath - Where to save the file (e.g., './downloads/file.pdf')
 */
export async function downloadFile(fileId: string, savePath: string) {
  return await driveService.downloadFile(fileId, savePath);
}
/** ----------------  Delete a file ---------------- **/

/**
 * Delete a file from Google Drive
 * @param fileId - Google Drive file ID
 */
export async function deleteFile(fileId: string) {
  return await driveService.deleteFile(fileId);
}
/** ----------------  Rename a file ---------------- **/

/**
 * Rename a file
 * @param fileId - Google Drive file ID
 * @param newName - New name for the file
 */
export async function renameFile(fileId: string, newName: string) {
  return await driveService.updateFileMetadata(fileId, { name: newName });
}
/** ----------------  Update file content ---------------- **/

/**
 * Update file content (replace existing file content)
 * @param fileId - Google Drive file ID
 * @param newFilePath - Path to new content file
 */
export async function updateFile(
  fileId: string,
  newContent: string,
  mimeType: MimeType
) {
  return await driveService.updateFileContent(fileId, newContent, mimeType);
}

/** ----------------  Get file metadata ---------------- **/

/**
 * Get file information
 * @param fileId - Google Drive file ID
 */
export async function getFileInfo(fileId: string) {
  return await driveService.getFileMetadata(fileId);
}

/** ----------------  Get image metadata for an image file ---------------- **/

/**
 * Get image metadata for an image file
 * @param fileId - Google Drive file ID of the image
 */
export async function getImageMetadata(fileId: string) {
  return await driveService.getImageMetadata(fileId);
}

/** ----------------  Get video metadata for a video file ---------------- **/

/**
 * Get video metadata for a video file
 * @param fileId - Google Drive file ID of the video
 */
export async function getVideoMetadata(fileId: string) {
  return await driveService.getVideoMetadata(fileId);
}
/** ----------------  Move a file to a different folder ---------------- **/

/**
 * Get complete file metadata including all available fields
 * @param fileId - Google Drive file ID
 */
export async function getCompleteFileInfo(fileId: string) {
  return await driveService.getCompleteFileMetadata(fileId);
}

/** ----------------  Move a file to a different folder ---------------- **/

/**
 * Move file to a different folder
 * @param fileId - Google Drive file ID
 * @param newFolderId - Destination folder ID
 */

export async function moveFile(fileId: string, newFolderId: string) {
  const file = await driveService.getFileMetadata(fileId);
  if (!file.success || !file.data) {
    return { success: false, error: "File not found" };
  }

  return await driveService.updateFileMetadata(fileId, {
    parents: [newFolderId],
  });
}

/** ----------------  Move a file by name to a different folder ---------------- **/

/**
 * Move file to a different folder by name
 * @param fileName - Name of the file to move
 * @param folderName - Name of the destination folder
 */

export async function moveFileByName(fileName: string, folderName: string) {
  // Resolve file and folder IDs by name in parallel for better performance
  const [fileResult, folderResult] = await Promise.all([
    getFileIdByName(fileName),
    getFolderIdByName(folderName),
  ]);

  if (!fileResult.success || !fileResult.fileId) {
    return { success: false, error: "File not found" };
  }

  if (!folderResult.success || !folderResult.folderId) {
    return { success: false, error: "Destination folder not found" };
  }

  // Move using resolved IDs
  return await moveFile(fileResult.fileId, folderResult.folderId);
}

/** ----------------  Copy a file ---------------- **/

/**
 * Copy a file
 * @param fileId - Google Drive file ID
 * @param newName - Optional: Name for the copy
 */
export async function copyFile(fileId: string, newName?: string) {
  // TODO: Implement copyFile in driveService or use a general API call method
  return await (driveService as any).copyFile(
    fileId,
    newName ? { name: newName } : undefined
  );
}

// ============================================
// JSON OPERATIONS
// ============================================

/** ----------------  Create a new JSON file on Google Drive ---------------- **/

/**
 * Create a new JSON file on Google Drive.
 * @param jsonContent - JSON object to store in the file.
 * @param name - Name for the new JSON file.
 */
export async function createJsonFile(jsonContent: any, name: string) {
  return await driveService.createJsonFile(JSON.stringify(jsonContent), name);
}

/** ----------------  Select JSON content from a Google Drive file ---------------- **/

/**
 * Select full JSON data from Google Drive file.
 * @param fileId - Google Drive file ID of the JSON file.
 * @returns Full JSON object.
 */
export async function selectJsonContent(fileId: string): Promise<any> {
  const data = await driveService.selectJsonContent(fileId);
  return {
    success: true,
    data,
  };
}

/** ----------------  Read JSON file content from Google Drive ---------------- **/

/**
 * Read JSON file content from Google Drive
 * @param fileId - Google Drive file ID
 */
export async function readJsonFileData(fileId: string): Promise<any> {
  const content = await readFileData(fileId);
  try {
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    return { success: false, error: "Failed to parse JSON file content" };
  }
}

/** ----------------  Add a new key-value pair to a JSON file on Google Drive ---------------- **/

/**
 * Add a new key-value pair to a JSON file on Google Drive.
 * Supports nested keys (e.g., "user.profile.name").
 */
export async function addJsonKeyValue(fileId: string, key: string, value: any) {
  try {
    // Step 1: Read existing JSON file content
    const readResponse = await driveService.readFileData(fileId, true);
    if (!readResponse.success || !readResponse.data) {
      throw new Error(readResponse.error || "Failed to read JSON file data");
    }

    // Step 2: Parse JSON
    let jsonData: Record<string, any>;
    try {
      jsonData = JSON.parse(readResponse.data as string);
    } catch {
      throw new Error("Invalid JSON format in file");
    }

    // Step 3: Add or update key (supports nested keys)
    const parts = key.split(".");
    let current = jsonData;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts.at(-1)!] = value;

    // Step 4: Update file on Google Drive
    const updateResponse = await driveService.updateJsonContent(
      fileId,
      jsonData
    );
    if (!updateResponse.success) {
      throw new Error(updateResponse.error || "Failed to update file");
    }

    return { success: true, data: updateResponse.data };
  } catch (error: any) {
    console.error("❌ Error adding key-value pair:", error.message);
    return { success: false, error: error.message };
  }
}

/** ----------------  Add a JSON object to a specified array path in a JSON file stored on Google Drive ---------------- **/

/**
 * Add a JSON object to a specified array path in a JSON file stored on Google Drive.
 * Supports nested array paths (e.g., "user.items.0").
 */
export async function pushJsonObjectToArray(
  fileId: string,
  arrayPath: string,
  newObject: any
) {
  return await driveService.pushJsonObjectToArray(fileId, arrayPath, newObject);
}

/** ----------------  Delete a key (supports nested paths like "user.profile.name") from a JSON file stored in Google Drive ---------------- **/

/**
 * Delete a key (supports nested paths like "user.profile.name")
 * from a JSON file stored in Google Drive.
 */
export async function deleteJsonFieldAndKeys(fileId: string, key: string) {
  try {
    const readResponse = await driveService.readFileData(fileId, true);
    if (!readResponse.success || !readResponse.data) {
      throw new Error(readResponse.error || "Failed to read JSON file data");
    }

    let jsonData: any;
    try {
      jsonData = JSON.parse(readResponse.data as string);
    } catch {
      throw new Error("Invalid JSON format in file");
    }

    const parts = key.split(".");
    let current = jsonData;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        throw new Error(`Key path '${key}' does not exist in JSON`);
      }
      current = current[part];
    }

    const lastKey = parts.at(-1)!;

    // ✅ Handle arrays properly
    if (Array.isArray(current)) {
      const index = parseInt(lastKey, 10);
      if (isNaN(index) || index < 0 || index >= current.length) {
        throw new Error(`Invalid array index: ${lastKey}`);
      }
      current.splice(index, 1); // 🧹 Proper removal
    } else {
      if (!(lastKey in current)) {
        throw new Error(`Key '${lastKey}' does not exist`);
      }
      delete current[lastKey];
    }

    // ✅ Save updated JSON
    const updateResponse = await driveService.updateJsonContent(
      fileId,
      jsonData
    );
    if (!updateResponse.success) {
      throw new Error(updateResponse.error || "Failed to update file");
    }

    return { success: true, data: updateResponse.data };
  } catch (error: any) {
    console.error("❌ Error deleting key-value pair:", error.message);
    return { success: false, error: error.message };
  }
}

/** ----------------  Update or rename a key in a JSON file stored on Google Drive ---------------- **/

/**
 * Update or rename a key in a JSON file stored on Google Drive.
 * Supports nested keys using dot notation (e.g., "user.profile.name").
 *
 * @param fileId - Google Drive file ID
 * @param keyPath - The existing key path to update (supports nested)
 * @param newKey - Optional new key name (if you want to rename the key)
 * @param newValue - Optional new value to assign
 */
export async function updateJsonFieldAndValues(
  fileId: string,
  keyPath: string,
  newKey?: string,
  newValue?: any
) {
  try {
    const readResponse = await driveService.readFileData(fileId, true);
    if (!readResponse.success || !readResponse.data) {
      throw new Error(readResponse.error || "Failed to read JSON file data");
    }

    let jsonData: Record<string, any>;
    try {
      jsonData = JSON.parse(readResponse.data as string);
    } catch {
      throw new Error("Invalid JSON format in file");
    }

    const parts = keyPath.split(".");
    let current = jsonData;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        throw new Error(`Key path '${keyPath}' does not exist in JSON`);
      }
      current = current[part];
    }

    const oldKey = parts.at(-1)!;

    if (!(oldKey in current)) {
      throw new Error(`Key '${oldKey}' does not exist`);
    }

    const existingValue = current[oldKey];
    const finalValue = newValue !== undefined ? newValue : existingValue;
    const finalKey = newKey && newKey !== oldKey ? newKey : oldKey;

    // ✅ Rebuild to preserve order AND ensure old key is removed
    const rebuilt: Record<string, any> = {};
    for (const k of Object.keys(current)) {
      if (k === oldKey) {
        rebuilt[finalKey] = finalValue; // rename or update key
      } else {
        rebuilt[k] = current[k];
      }
    }

    // Replace the object content cleanly (not merge)
    Object.keys(current).forEach((k) => delete current[k]);
    Object.assign(current, rebuilt);

    const updateResponse = await driveService.updateJsonContent(
      fileId,
      jsonData
    );
    if (!updateResponse.success) {
      throw new Error(updateResponse.error || "Failed to update file");
    }

    return { success: true, data: updateResponse.data };
  } catch (error: any) {
    console.error("❌ Error updating JSON key-value:", error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// FOLDER OPERATIONS
// ============================================

/** ----------------  Create a new folder ---------------- **/

/**
 * Create a new folder
 * @param folderName - Name of the folder
 * @param parentFolderId - Optional: Parent folder ID (creates in root if not specified)
 */
export async function createFolder(
  folderName: string,
  parentFolderId?: string
) {
  return await driveService.createFolder(folderName, parentFolderId);
}

/** ----------------  Delete a folder ---------------- **/

/**
 * Delete a folder
 * @param folderId - Google Drive folder ID
 */
export async function deleteFolder(folderId: string) {
  return await driveService.deleteFile(folderId);
}

/** ----------------  List folder by name ---------------- **/

/**
 * List folder by name
 * @param folderName - Name of the folder
 */
export async function listFoldersByName(folderName: string) {
  return await searchByNameHelper(folderName, "folder", "exact");
}

/** ----------------  List all folders ---------------- **/

export async function listAllFolders() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.FOLDER}' and trashed=false`,
  });
}

/** ----------------  List folders in a specific folder ---------------- **/

/**
 * List specific folder in a specific folder
 * @param folderId - Google Drive folder ID
 */
export async function listFoldersInFolder(folderId: string) {
  return await driveService.listFiles({
    query: `'${folderId}' in parents and mimeType='${MIME_TYPES.FOLDER}' and trashed=false`,
  });
}

/** ----------------  List files in a specific folder ---------------- **/

/**
 * List files in a specific folder
 * @param folderId - Google Drive folder ID
 */
export async function listFilesInFolder(folderId: string) {
  return await driveService.listFiles({
    query: `'${folderId}' in parents and trashed=false`,
  });
}

// ============================================
// SEARCH OPERATIONS
// ============================================

/** ----------------  Search files by name ---------------- **/

/**
 * Search files by name
 * @param fileName - Name or partial name to search
 */
export async function searchByName(fileName: string) {
  return await searchByNameHelper(fileName, "file", "contains");
}

/** ----------------  Search files by exact name ---------------- **/

/**
 * Search files by exact name
 * @param fileName - Exact file name
 */
export async function searchByExactName(fileName: string) {
  return await searchByNameHelper(fileName, "file", "exact");
}

/** ----------------  Search by file type ---------------- **/

/**
 * Search by file type
 * @param type - 'pdf', 'image', 'document', 'spreadsheet', 'folder', or custom mime type
 */
export async function searchByType(type: string) {
  const mimeTypes: Record<string, string> = {
    pdf: MIME_TYPES.PDF,
    image: "image/",
    document: MIME_TYPES.DOCUMENT,
    spreadsheet: MIME_TYPES.SPREADSHEET,
    presentation: MIME_TYPES.PRESENTATION,
    folder: MIME_TYPES.FOLDER,
  };

  const mimeType = mimeTypes[type.toLowerCase()] || type;
  const query = mimeType.endsWith("/")
    ? `mimeType contains '${mimeType}' and trashed=false`
    : `mimeType='${mimeType}' and trashed=false`;

  return await driveService.listFiles({ query });
}

/** ----------------  Search files modified after a date ---------------- **/

/**
 * Search files modified after a date
 * @param date - Date string (e.g., '2024-01-01' or '2024-01-01T10:00:00')
 */
export async function searchModifiedAfter(date: string) {
  const isoDate = date.includes("T") ? date : `${date}T00:00:00`;
  return await driveService.listFiles({
    query: `modifiedTime > '${isoDate}' and trashed=false`,
    orderBy: "modifiedTime desc",
  });
}

/** ----------------  Search starred files ---------------- **/

export async function searchStarredFiles() {
  return await driveService.listFiles({
    query: "starred=true and trashed=false",
  });
}

/** ----------------  Search shared files ---------------- **/

export async function searchSharedFiles() {
  return await driveService.listFiles({
    query: "sharedWithMe=true and trashed=false",
  });
}

/** ----------------  Search files containing text ---------------- **/

/**
 * Search files containing text
 * @param searchText - Text to search for in file content
 */
export async function searchByContent(searchText: string) {
  return await driveService.listFiles({
    query: `fullText contains '${searchText}' and trashed=false`,
  });
}

// ============================================
// LIST OPERATIONS
// ============================================

/** ----------------  List all files ---------------- **/

/**
 * List all files (paginated, default 10 files)
 * @param limit - Number of files to return (default: 10)
 */
export async function listFiles(limit: number = 10) {
  return await driveService.listFiles({
    pageSize: limit,
    query: "trashed=false",
  });
}

/** ----------------  List all recent files ---------------- **/

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
    orderBy: "modifiedTime desc",
    pageSize: 20,
  });
}

/** ----------------  List all PDFs ---------------- **/

export async function listPDFs() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.PDF}' and trashed=false`,
  });
}

/** ----------------  List all images ---------------- **/

export async function listImages() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.JPEG}' or mimeType='${MIME_TYPES.PNG}' or mimeType='${MIME_TYPES.GIF}' or mimeType='${MIME_TYPES.SVG}' and trashed=false`,
  });
}

/** ----------------  List all video files ---------------- **/

export async function listVideos() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.MP4}' or mimeType='${MIME_TYPES.MKV}' or mimeType='${MIME_TYPES.WEBM}' or mimeType='${MIME_TYPES.AVI}' and trashed=false`,
  });
}

/** ----------------  List all audio files ---------------- **/

export async function listAudios() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.MP3}' or mimeType='${MIME_TYPES.WAV}' and trashed=false`,
  });
}

/** ----------------  List all archive files ---------------- **/

export async function listArchives() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.ZIP}' or mimeType='${MIME_TYPES.RAR}' and trashed=false`,
  });
}

/** ----------------  List all json files ---------------- **/

export async function listJSONs() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.JSON}' and trashed=false`,
  });
}

/** ----------------  List all sheet files ---------------- **/

export async function listSheets() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.SPREADSHEET}' and trashed=false`,
  });
}

/** ----------------  List all presentation files ---------------- **/

export async function listPresentations() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.PRESENTATION}' and trashed=false`,
  });
}

/** ----------------  List all docs files ---------------- **/

export async function listDocs() {
  return await driveService.listFiles({
    query: `mimeType='${MIME_TYPES.DOCUMENT}' and trashed=false`,
  });
}

// ============================================
// BATCH OPERATIONS
// ============================================

/** ----------------  Upload Multiple Files ---------------- **/

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

/** ----------------  Delete Multiple Files ---------------- **/

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

/** ----------------  Download Multiple Files ---------------- **/

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

/** ----------------  Encrypt Text ---------------- **/

/**
 * Encrypts plain text using AES-256-GCM with password-based key derivation.
 * @param plainText - Text to encrypt
 * @param password - Password for key derivation
 * @param salt - Salt for key derivation
 * @returns Encrypted text
 */
export async function encryptText(
  plainText: string,
  password: string,
  salt: string
) {
  return await driveService.encryptText(plainText, password, salt);
}

/** ----------------  Decrypt Text ---------------- **/

/**
 * Decrypts encrypted text using AES-256-GCM with password-based key derivation.
 * @param encryptedText - Text to decrypt
 * @param password - Password for key derivation
 * @param salt - Salt for key derivation
 * @returns Decrypted text
 */
export async function decryptText(
  encryptedText: string,
  password: string,
  salt: string
) {
  return await driveService.decryptText(encryptedText, password, salt);
}

/** ----------------  Convert Files and Folders to Zip ---------------- **/

/**
 * Convert multiple files and folders to a single zip archive
 * @param options - Conversion options
 */
export async function filesAndFoldersToZip(options: {
  folderId?: string;
  fileIds?: string[];
  zipName: string;
  uploadToFolderId?: string;
  password?: string;
}) {
  return await driveService.convertFilesAndFoldersToZip(options);
}
/** ----------------  Find Duplicate Files & Folder ---------------- **/

export async function findDuplicateFilesAndFolders(): Promise<void> {
  return await driveService.findDuplicate();
}

/** ---------------- Get File Type Breakdown ---------------- **/

/**
 * Get file type breakdown for a folder
 * @param parentId - Folder ID to analyze (default: 'root')
 * @returns Object mapping file types to counts
 */
export async function getFileTypeBreakdown(
  parentId: string = "root"
): Promise<Record<string, number>> {
  return await driveService.getFileTypeBreakdown(parentId);
}

/** ----------------  Get All Files in Parent ---------------- **/

/**
 * Get all files in a parent folder
 * @param parentId - Folder ID to analyze (default: 'root')
 * @returns Array of file objects
 */
export async function getAllFilesInParent(parentId: string): Promise<any> {
  return await driveService.getAllFilesInParent(parentId);
}

/** ----------------  Check if File Exists ---------------- **/

/**
 * Check if file exists by name
 * @param fileName - File name to check
 */
export async function fileExists(fileName: string): Promise<boolean> {
  const result = await searchByExactName(fileName);
  return result.success && (result.data?.files.length || 0) > 0;
}

/** ----------------  Get Storage Quota ---------------- **/

export async function getStorageQuota() {
  return await driveService.getStorageQuota();
}

/** ----------------  Share File ---------------- **/

/**
 * Share File
 * @param fileId - File ID to share
 * @param emailAddress - Email address of the user to share with
 * @param role - Role to assign (default: 'reader')
 */
export async function shareFile(
  fileId: string,
  emailAddress: string,
  role: string = "reader"
) {
  return await driveService.shareFile(fileId, emailAddress, role);
}

/** ----------------  Create Stream ---------------- **/

//Create Stream
/**
 * Create stream for any Google Drive file (audio, video, image, doc, etc.)
 */
export async function createStream(fileId: string, targetMimeType: string) {
  return await driveService.createStream(fileId, targetMimeType);
}

/** ----------------  Get Folder ID by Name ---------------- **/
/**
 * Get folder ID by name
 * @param folderName - Folder name to find
 */
export async function getFolderIdByName(folderName: string) {
  const result = await getIdByNameHelper(folderName, "folder");

  if (result.success) {
    return {
      success: true,
      folderId: result.id || "",
      folder: result.item,
    };
  }

  return { success: false, error: result.error };
}

/** ----------------  Get File ID by Name ---------------- **/

/**
 * Get file ID by name
 * @param fileName - File name to find
 */
export async function getFileIdByName(fileName: string) {
  const result = await getIdByNameHelper(fileName, "file");

  if (result.success) {
    return {
      success: true,
      fileId: result.id || "",
      file: result.item,
    };
  }

  return { success: false, error: result.error };
}

// ============================================
// Conversion Operation
// ============================================

/**
 * Convert a file to a Docs file
 * @param fileId - File ID to convert
 */

/** ---------------- Google Docs Conversions ---------------- **/

export async function convertTextToDocs(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.DOCUMENT
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Text → Google Docs");
}

export async function convertDocsToPdf(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PDF
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Docs → PDF");
}

export async function convertDocsToWord(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.WORD
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Docs → Word");
}

export async function convertDocsToText(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.TEXT
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Docs → Text");
}

/** ---------------- Google Sheets Conversions ---------------- **/

export async function convertCsvToSheet(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.SPREADSHEET
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert CSV → Google Sheet");
}

export async function convertExcelToSheet(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.SPREADSHEET
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Excel → Google Sheet");
}

export async function convertSheetToCsv(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.CSV
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Sheet → CSV");
}

export async function convertSheetToPdf(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PDF
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Sheet → PDF");
}

/** ---------------- Google Slides Conversions ---------------- **/

/**
 * Convert a PPT file to Google Slides
 * @param fileId - File ID to convert
 */
export async function convertPptToSlides(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PRESENTATION
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert PPT → Google Slides");
}

/**
 * Convert a Google Slides file to PPTX
 * @param fileId - File ID to convert
 */
export async function convertSlidesToPpt(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.POWERPOINT
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Slides → PPTX");
}

export async function convertSlidesToPdf(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PDF
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Slides → PDF");
}

/** ---------------- PDF Conversions ---------------- **/

export async function convertPdfToDocs(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.DOCUMENT
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert PDF → Google Docs");
}

/** ---------------- Drawings Conversions ---------------- **/

export async function convertDrawingToPng(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PNG
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Drawing → PNG");
}

export async function convertDrawingToPdf(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PDF
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Drawing → PDF");
}

// ============================================
// Export all operations
// ============================================

export const driveOperations = {
  // File operations
  readFileData,
  uploadFile,
  downloadFile,
  deleteFile,
  renameFile,
  updateFile,
  getFileIdByName,
  getFileInfo,
  getCompleteFileInfo,
  moveFile,
  moveFileByName,
  copyFile,

  // MetaData Operation
  getImageMetadata,
  getVideoMetadata,

  //Json operations
  createJsonFile,
  readJsonFileData,
  selectJsonContent,
  addJsonKeyValue,
  pushJsonObjectToArray,
  updateJsonFieldAndValues,
  deleteJsonFieldAndKeys,

  // Folder operations
  createFolder,
  deleteFolder,
  getFolderIdByName,
  listFoldersByName,
  listAllFolders,
  listFoldersInFolder,
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
  listVideos,
  listAudios,
  listArchives,
  listJSONs,
  listSheets,
  listPresentations,
  listDocs,

  // Batch operations
  uploadMultipleFiles,
  deleteMultipleFiles,
  downloadMultipleFiles,

  // Utility operations
  filesAndFoldersToZip,
  findDuplicateFilesAndFolders,
  getFileTypeBreakdown,
  getAllFilesInParent,
  shareFile,
  fileExists,
  getStorageQuota,
  createStream,

  //Conversion Operation
  convertTextToDocs,
  convertDocsToPdf,
  convertDocsToWord,
  convertDocsToText,
  convertCsvToSheet,
  convertExcelToSheet,
  convertSheetToCsv,
  convertSheetToPdf,
  convertPptToSlides,
  convertSlidesToPpt,
  convertSlidesToPdf,
  convertPdfToDocs,
  convertDrawingToPng,
  convertDrawingToPdf,
};
