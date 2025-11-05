import { google, Auth } from "googleapis";
import { drive_v3 } from "googleapis";
import * as fs from "fs";
import * as path from "path";
import type {
  GoogleCredentials,
  TokenData,
  ListFilesParams,
  UploadFileMetadata,
  ApiResponse,
  FileMetadata,
  ListFilesResponse,
} from "../types/index";

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
    filePath: string
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const media = {
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.update({
        fileId: fileId,
        media: media,
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
}
