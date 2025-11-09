import { google, Auth } from "googleapis";
import { drive_v3 } from "googleapis";
import * as fs from "fs";
import * as path from "path";
import {
  GoogleCredentials,
  TokenData,
  ListFilesParams,
  UploadFileMetadata,
  ApiResponse,
  FileMetadata,
  ListFilesResponse,
  ImageMediaMetadata,
  VideoMediaMetadata,
  StorageQuota,
} from "../types/index";
import { MIME_TYPES } from "../const/index";
import archiver from "archiver";
import archiverZipEncrypted from "archiver-zip-encrypted";
import { Readable, PassThrough } from "stream";

(archiver as any).registerFormat("zip-encrypted", archiverZipEncrypted);

export class GoogleDriveService {
  private oauth2Client: Auth.OAuth2Client;
  private drive: drive_v3.Drive;

  constructor(credentials: GoogleCredentials) {
    // Handle both web and installed app credential formats
    const creds = credentials.web || credentials.installed || credentials;
    const { client_id, client_secret } = creds;
    const redirect_uri =
      "redirect_uris" in creds
        ? creds.redirect_uris[0]
        : (credentials as any).redirect_uri;

    this.oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri
    );

    this.drive = google.drive({ version: "v3", auth: this.oauth2Client });
  }

  /**
   * Set credentials and enable auto-refresh
   */
  public setCredentials(tokens: TokenData): void {
    this.oauth2Client.setCredentials(tokens);

    // Auto-save refreshed tokens
    this.oauth2Client.on("tokens", (newTokens) => {
      if (newTokens.refresh_token) {
        tokens.refresh_token = newTokens.refresh_token;
      }
      tokens.access_token = newTokens.access_token!;
      tokens.expiry_date = newTokens.expiry_date!;

      // Save to file
      fs.writeFileSync("./tokens.json", JSON.stringify(tokens, null, 2));
      console.log("🔄 Tokens refreshed and saved");
    });
  }

  /**
   * Get File
   */
  public async getFile(fileId: string): Promise<ApiResponse<FileMetadata>> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields:
          "id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink",
      });

      return {
        success: true,
        data: response.data as FileMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  /**
   * Read file data directly (returns Buffer or text)
   */
  public async readFileData(
    fileId: string,
    asText: boolean = true
  ): Promise<ApiResponse<string | Buffer>> {
    try {
      const response = await this.drive.files.get(
        { fileId: fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );

      const dataBuffer = Buffer.from(response.data as ArrayBuffer);

      return {
        success: true,
        data: asText ? dataBuffer.toString("utf-8") : dataBuffer,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * List files in Google Drive
   */
  public async listFiles(
    params: ListFilesParams = {}
  ): Promise<ApiResponse<ListFilesResponse>> {
    try {
      const response = await this.drive.files.list({
        pageSize: params.pageSize || 10,
        fields:
          "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime)",
        q: params.query || undefined,
        orderBy: params.orderBy || "modifiedTime desc",
        pageToken: params.pageToken || undefined,
      });

      return {
        success: true,
        data: {
          files: response.data.files as FileMetadata[],
          nextPageToken: response.data.nextPageToken || undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get file metadata
   */
  public async getFileMetadata(
    fileId: string
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields:
          "id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink",
      });

      return {
        success: true,
        data: response.data as FileMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Download file to local storage
   */
  public async downloadFile(
    fileId: string,
    destPath: string
  ): Promise<ApiResponse<{ path: string }>> {
    try {
      const dest = fs.createWriteStream(destPath);

      const response = await this.drive.files.get(
        { fileId: fileId, alt: "media" },
        { responseType: "stream" }
      );

      return new Promise((resolve, reject) => {
        response.data
          .on("end", () => {
            resolve({ success: true, data: { path: destPath } });
          })
          .on("error", (err: Error) => {
            reject({ success: false, error: err.message });
          })
          .pipe(dest);
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Upload file to Google Drive (multipart upload)
   */
  public async uploadFile(
    filePath: string,
    metadata: UploadFileMetadata = {}
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const fileMetadata: UploadFileMetadata = {
        name: metadata.name || path.basename(filePath),
        parents: metadata.parents || [],
      };

      const media = {
        mimeType: metadata.mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, mimeType, size, webViewLink",
      });

      return {
        success: true,
        data: response.data as FileMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update file content
   */
  public async updateFileContent(
    fileId: string,
    content: string,
    mimeType: string
  ) {
    try {
      const buffer = Buffer.from(content, "utf-8");

      const res = await this.drive.files.update({
        fileId,
        media: {
          mimeType,
          body: buffer,
        },
      });

      return res.data;
    } catch (error: any) {
      console.error("❌ Error updating file content:", error.message);
      throw error;
    }
  }

  /**
   * Update file metadata
   */
  public async updateFileMetadata(
    fileId: string,
    metadata: Partial<FileMetadata>
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const response = await this.drive.files.update({
        fileId: fileId,
        requestBody: metadata,
        fields: "id, name, mimeType, modifiedTime",
      });

      return {
        success: true,
        data: response.data as FileMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete file from Google Drive
   */
  public async deleteFile(
    fileId: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      await this.drive.files.delete({
        fileId: fileId,
      });

      return {
        success: true,
        data: { message: "File deleted successfully" },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create folder in Google Drive
   */
  public async createFolder(
    folderName: string,
    parentFolderId?: string
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const fileMetadata: any = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      };

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: "id, name, mimeType",
      });

      return {
        success: true,
        data: response.data as FileMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update JSON file content directly (without needing local file)
   */
  public async updateJsonContent(
    fileId: string,
    jsonData: Record<string, any>
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const response = await this.drive.files.update({
        fileId,
        requestBody: {
          mimeType: "application/json", // ✅ ensure proper file type
        },
        media: {
          mimeType: "application/json",
          body: JSON.stringify(jsonData, null, 2),
        },
        fields: "id, name, mimeType, modifiedTime, webViewLink",
      });

      return {
        success: true,
        data: response.data as FileMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Add a new key-value pair to a JSON file in Google Drive.
   * If the key already exists, it will be overwritten.
   */
  public async addJsonContent(
    fileId: string,
    key: string,
    value: any
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      // Step 1: Read existing JSON content
      const fileData = await this.readFileData(fileId, true);
      if (!fileData.success) {
        throw new Error(fileData.error || "Failed to read JSON file data");
      }

      // Step 2: Parse the JSON
      let jsonData: Record<string, any>;
      try {
        jsonData = JSON.parse(fileData.data as string);
      } catch {
        throw new Error("Invalid JSON format in file");
      }

      // Step 3: Add or overwrite key
      jsonData[key] = value;

      // Step 4: Upload updated JSON content
      const response = await this.drive.files.update({
        fileId,
        media: {
          mimeType: "application/json",
          body: JSON.stringify(jsonData, null, 2),
        },
        fields: "id, name, mimeType, modifiedTime, webViewLink",
      });

      return {
        success: true,
        data: response.data as FileMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search files by query
   */
  public async searchFiles(
    searchQuery: string,
    pageSize: number = 10
  ): Promise<ApiResponse<ListFilesResponse>> {
    return this.listFiles({
      query: searchQuery,
      pageSize: pageSize,
    });
  }

  /**
   * Get image metadata for a file
   */
  public async getImageMetadata(
    fileId: string
  ): Promise<ApiResponse<ImageMediaMetadata>> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: "imageMediaMetadata",
      });

      return {
        success: true,
        data: response.data.imageMediaMetadata as ImageMediaMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get video metadata for a file
   */
  public async getVideoMetadata(
    fileId: string
  ): Promise<ApiResponse<VideoMediaMetadata>> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: "videoMediaMetadata",
      });

      return {
        success: true,
        data: response.data.videoMediaMetadata as VideoMediaMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  /**
   * Create a JSON file on Google Drive
   */
  public async createJsonFile(jsonContent: string, name: string) {
    const response = await this.drive.files.create({
      requestBody: {
        name: name,
        mimeType: "application/json",
      },
      media: {
        mimeType: "application/json",
        body: jsonContent,
      },
      fields: "id, name, webViewLink, webContentLink",
    });

    return {
      success: true,
      data: response.data as FileMetadata,
    };
  }

  /**
   * Get complete file metadata including image/video metadata
   */
  public async getCompleteFileMetadata(
    fileId: string
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: "*", // Get all available fields including metadata
      });

      return {
        success: true,
        data: response.data as FileMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  /**
   * Get storageQuota
   */
  public async getStorageQuota(): Promise<ApiResponse<StorageQuota>> {
    try {
      const response = await this.drive.about.get({
        fields: "storageQuota",
      });

      return {
        success: true,
        data: response.data.storageQuota as StorageQuota,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  /**
   * Share File
   */
  public async shareFile(
    fileId: string,
    emailAddress: string,
    role: string = "reader"
  ): Promise<ApiResponse<void>> {
    try {
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          type: "user",
          role: role,
          emailAddress: emailAddress,
        },
      });
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  /**
   * Convert Regular File to Google Docs
   */

  public async ConversionFunction(
    fileId: string,
    targetMimeType: string
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      // Step 1: Get file metadata
      const originalFile = await this.drive.files.get({
        fileId,
        fields: "id, name, mimeType",
      });

      const sourceMime =
        originalFile.data.mimeType || "application/octet-stream";
      const baseName =
        originalFile.data.name?.split(".")[0] || "Converted_File";

      let fileStream: any;

      // Step 2: Handle different Google file types
      if (sourceMime.startsWith("application/vnd.google-apps.")) {
        // 🧠 Smart Export logic for Google native files
        console.log("🧾 Exporting Google Editor file...");

        // Define exportable formats for each Google type
        const exportableTargets: Record<string, string[]> = {
          [MIME_TYPES.DOCUMENT]: [
            MIME_TYPES.PDF,
            MIME_TYPES.WORD,
            MIME_TYPES.TEXT,
          ],
          [MIME_TYPES.SPREADSHEET]: [
            MIME_TYPES.PDF,
            MIME_TYPES.CSV,
            MIME_TYPES.EXCEL,
          ],
          [MIME_TYPES.PRESENTATION]: [MIME_TYPES.PDF, MIME_TYPES.POWERPOINT],
          [MIME_TYPES.DRAWING]: [
            MIME_TYPES.PDF,
            MIME_TYPES.PNG,
            MIME_TYPES.JPEG,
            MIME_TYPES.SVG,
          ],
        };

        // Validate export support
        const allowedTargets = exportableTargets[sourceMime];
        if (!allowedTargets || !allowedTargets.includes(targetMimeType)) {
          return {
            success: false,
            error: `Export from ${sourceMime} to ${targetMimeType} not supported by Google Drive API.`,
          };
        }

        // Export as stream
        const exportResponse = await this.drive.files.export(
          { fileId, mimeType: targetMimeType },
          { responseType: "stream" }
        );
        fileStream = exportResponse.data;
      } else {
        // 🔽 Binary file download
        console.log("📦 Downloading binary file...");
        const downloadResponse = await this.drive.files.get(
          { fileId, alt: "media" },
          { responseType: "stream" }
        );
        fileStream = downloadResponse.data;
      }

      // Step 3: Upload new converted file
      const uploadResponse = await this.drive.files.create({
        requestBody: {
          name: `${baseName}_converted`,
          mimeType: targetMimeType,
        },
        media: {
          mimeType: sourceMime,
          body: fileStream,
        },
        fields: "id, name, mimeType, webViewLink, modifiedTime",
      });

      return {
        success: true,
        data: uploadResponse.data as FileMetadata,
      };
    } catch (error: any) {
      console.error("❌ Conversion Error:", error?.message || error);
      return {
        success: false,
        error: error?.message || "Conversion failed",
      };
    }
  }
  /**
   * Create stream for any Google Drive file (audio, video, image, doc, etc.)
   */
  public async createStream(
    fileId: string,
    targetMimeType?: string
  ): Promise<NodeJS.ReadableStream | null> {
    try {
      const file = await this.drive.files.get({
        fileId,
        fields: "id, name, mimeType",
      });

      const sourceMime = file.data.mimeType || "application/octet-stream";
      let fileStream: NodeJS.ReadableStream;

      // 🧠 Google Docs, Sheets, Slides, etc.
      if (sourceMime.startsWith("application/vnd.google-apps.")) {
        if (!targetMimeType) {
          throw new Error(
            "Target MIME type required for Google native files (like Docs or Sheets)"
          );
        }

        const exportRes = await this.drive.files.export(
          { fileId, mimeType: targetMimeType },
          { responseType: "stream" }
        );
        fileStream = exportRes.data;
      } else {
        // 📦 All normal files (audio, video, pdf, image, etc.)
        const downloadRes = await this.drive.files.get(
          { fileId, alt: "media" },
          { responseType: "stream" }
        );
        fileStream = downloadRes.data;
      }

      return fileStream;
    } catch (error: any) {
      console.error("❌ Stream creation failed:", error.message);
      return null;
    }
  }
  /**
   * Select json key value from google drive file
   */
  public async selectJsonContent(fileId: string): Promise<any> {
    try {
      const fileStream = await this.createStream(fileId, MIME_TYPES.JSON);
      if (!fileStream) {
        throw new Error("Failed to create stream for JSON file");
      }

      let jsonContent = "";
      for await (const chunk of fileStream) {
        jsonContent += chunk.toString();
      }

      const jsonData = JSON.parse(jsonContent);

      // ✅ directly return full array or object
      return jsonData;
    } catch (error: any) {
      console.error("❌ JSON selection failed:", error.message);
      return null;
    }
  }

  // Push new object to a JSON array field
  public async pushJsonObjectToArray(
    fileId: string,
    arrayPath: string,
    newObject: any
  ): Promise<any> {
    try {
      const fileStream = await this.createStream(fileId, MIME_TYPES.JSON);
      if (!fileStream) throw new Error("Failed to create stream for JSON file");

      let jsonContent = "";
      for await (const chunk of fileStream) {
        jsonContent += chunk.toString();
      }

      const jsonData = JSON.parse(jsonContent);

      // ✅ if path is empty and root is array → push directly
      if (arrayPath.trim() === "") {
        if (Array.isArray(jsonData)) {
          jsonData.push(newObject);
        } else {
          throw new Error("Root JSON is not an array");
        }
      } else {
        // 👇 handle nested array path (like "users", "0.friends", etc.)
        const keys = arrayPath.split(".");
        let current = jsonData;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!current[key]) current[key] = {}; // create nested if missing
          current = current[key];
        }

        const finalKey = keys[keys.length - 1];

        if (!Array.isArray(current[finalKey])) {
          // if not array, convert or initialize
          current[finalKey] = current[finalKey] ? [current[finalKey]] : [];
        }

        current[finalKey].push(newObject);
      }

      // ✅ update file content in Drive
      const updatedFile = await this.updateFileContent(
        fileId,
        JSON.stringify(jsonData, null, 2),
        MIME_TYPES.JSON
      );

      return {
        success: true,
        data: updatedFile,
      };
    } catch (error: any) {
      console.error("❌ Error pushing new object:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Zip a Drive folder (supports nested folders, password, and same-level saving)
   **/

  public async convertFilesAndFoldersToZip(options: {
    folderId?: string;
    fileIds?: string[];
    zipName: string;
    uploadToFolderId?: string;
    password?: string;
  }): Promise<{
    success: boolean;
    data?: { id: string; name: string; webViewLink: string };
    error?: string;
  }> {
    console.log("🟢 Starting convertFilesAndFoldersToZip...");
    const {
      folderId,
      fileIds = [],
      zipName,
      uploadToFolderId,
      password,
    } = options;

    try {
      if (folderId && fileIds.length > 0) {
        throw new Error(
          "⚠️ You can select either a folder OR multiple files, not both."
        );
      }
      if (!folderId && fileIds.length === 0) {
        throw new Error("⚠️ Please select a folder or files to zip.");
      }

      // 🔍 Step 1: Determine parent folder
      let parentFolderId = uploadToFolderId;
      if (!parentFolderId) {
        const referenceId = folderId || fileIds[0];
        const info = await this.drive.files.get({
          fileId: referenceId,
          fields: "parents",
        });
        const parents = info.data.parents;
        if (!parents || parents.length === 0) {
          throw new Error("⚠️ Could not determine parent folder.");
        }
        parentFolderId = parents[0];
      }

      // 🧩 Step 2: Create streaming ZIP + PassThrough
      const archive = archiver((password ? "zip-encrypted" : "zip") as any, {
        zlib: { level: 9 },
        encryptionMethod: password ? "aes256" : undefined,
        password,
      });

      const passThrough = new PassThrough();
      archive.pipe(passThrough);

      // 🚀 Step 3: Start uploading immediately while archiving
      const uploadPromise = this.drive.files.create({
        requestBody: {
          name: zipName.endsWith(".zip") ? zipName : `${zipName}.zip`,
          parents: [parentFolderId],
        },
        media: {
          mimeType: "application/zip",
          body: passThrough, // direct live stream
        },
        fields: "id, name, webViewLink",
      });

      // 🗂 Step 4: Add files/folders to archive
      const addFolderToArchive = async (id: string, currentPath = "") => {
        const res = await this.drive.files.list({
          q: `'${id}' in parents and trashed=false`,
          fields: "files(id, name, mimeType)",
        });

        const files = res.data.files || [];
        for (const file of files) {
          if (file.mimeType === "application/vnd.google-apps.folder") {
            await addFolderToArchive(file.id!, `${currentPath}${file.name}/`);
          } else {
            const stream = await this.createStreamfilesandFolder(file.id!);
            if (!stream) continue;

            const nodeStream =
              stream instanceof Readable
                ? stream
                : Readable.fromWeb(stream as any);

            archive.append(nodeStream, { name: `${currentPath}${file.name}` });
            console.log(`📦 Added: ${currentPath}${file.name}`);
          }
        }
      };

      if (folderId) {
        console.log("📁 Zipping folder...");
        await addFolderToArchive(folderId);
      } else {
        console.log("📄 Zipping multiple files...");
        for (const fileId of fileIds) {
          const meta = await this.drive.files.get({
            fileId,
            fields: "id, name",
          });
          const name = meta.data.name || `file_${fileId}`;
          const stream = await this.createStreamfilesandFolder(fileId);
          if (!stream) continue;

          const nodeStream =
            stream instanceof Readable
              ? stream
              : Readable.fromWeb(stream as any);

          archive.append(nodeStream, { name });
          console.log(`📦 Added file: ${name}`);
        }
      }

      // ✅ Step 5: Finalize archive & wait for upload
      await archive.finalize();
      const uploadRes = await uploadPromise;

      console.log(
        `✅ Uploaded ZIP: ${uploadRes.data.webViewLink} ${
          password ? "(🔐 password protected)" : ""
        }`
      );

      return {
        success: true,
        data: {
          id: uploadRes.data.id!,
          name: uploadRes.data.name!,
          webViewLink: uploadRes.data.webViewLink!,
        },
      };
    } catch (err: any) {
      console.error("❌ convertFilesAndFoldersToZip failed:", err.message);
      return {
        success: false,
        error: err.message || "Unknown error",
      };
    }
  }

private async createStreamfilesandFolder(fileId: string): Promise<NodeJS.ReadableStream | null> {
  try {
    // 🔍 Get file metadata first
    const meta = await this.drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    const mimeType = meta.data.mimeType;

    // 🧩 Exportable Google file types with alternate editable formats
    const exportMap: Record<string, string> = {
      "application/vnd.google-apps.document":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/vnd.google-apps.spreadsheet":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
      "application/vnd.google-apps.presentation":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
      "application/vnd.google-apps.drawing": "image/png", // PNG
    };

    if (exportMap[mimeType!]) {
      console.log(`📤 Exporting ${meta.data.name} (${mimeType})`);
      const res = await this.drive.files.export(
        { fileId, mimeType: exportMap[mimeType!] },
        { responseType: "stream" }
      );
      return res.data;
    }

    // 🧱 Normal binary file download
    const res = await this.drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    return res.data;
  } catch (err: any) {
    console.warn(
      `⚠️ Failed to stream file ${fileId}:`,
      JSON.stringify(err.response?.data || err.message, null, 2)
    );
    return null;
  }
}

}
