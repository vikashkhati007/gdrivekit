## 🧩 gdrivekit

> **Google Drive file automation in just a few lines of code.**
> Perform uploads, downloads, folder management, and advanced search operations effortlessly using TypeScript or Node.js.

---

### 🚀 Features

* 📂 Upload, download, and manage Google Drive files
* 🗂️ Create and organize folders
* 🔍 Powerful search and filter utilities
* ⚙️ Batch file operations
* ⚡ Minimal setup, lightweight, and easy to use
* 💡 Works with Node.js and Bun

---

### 📦 Installation

```bash
npm install gdrivekit
```

or

```bash
bun add gdrivekit
```

---

### 💻 Example Usage

### ⚙️ One-Time Setup (Token Generation)

Before you can use Google Drive operations, you must generate **access and refresh tokens**.
This only needs to be done **once** — the tokens will be stored locally and reused automatically.

```ts
import { generateCredentialsAndTokens } from "gdrivekit";

await generateCredentialsAndTokens({
  clientid: process.env.GOOGLE_CLIENT_ID!,
  projectid: process.env.GOOGLE_PROJECT_ID!,
  clientsecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirecturis: ["http://localhost:3000/oauth2callback"],
  javascriptorigins: ["http://localhost:3000"],
});
```

✅ **Run this code once** to authenticate your app and save tokens (usually in `tokens.json`).
After that, you **don’t need to call it again** unless you delete your tokens or change your Google credentials.

---

# 🔄 Initializing the Drive Service

Once tokens are generated, you can initialize the Google Drive service and perform file operations:

```ts
import { initDriveService, operations } from "gdrivekit";

async function main() {
  initDriveService();

  // Example: Search files by name
  const files = await operations.searchByName("test");
  console.log(files.data?.files);
}

main();
```

---

## 🧠 Available Operations

### 📁 **File Operations**

| Method             | Description                               |
| ------------------ | ----------------------------------------- |
| `readFileData()`   | Read file content                         |
| `uploadFile()`     | Upload a new file to Google Drive         |
| `downloadFile()`   | Download a file from Drive                |
| `deleteFile()`     | Permanently delete a file                 |
| `renameFile()`     | Rename an existing file                   |
| `updateFile()`     | Update file metadata or content           |
| `getFileInfo()`    | Get details of a specific file            |
| `getFileIdByName()`   | Fetch file ID by its name              |
| `getCompleteFileInfo()` | Get complete file metadata including all fields |
| `moveFile()`       | Move file to another folder using file ID |
| `moveFileByName()` | Move file by its name                     |
| `copyFile()`       | Make a copy of a file in Drive            |

---

### **MetaData Operation**

| Method               | Description                                     |
| `getImageMetadata()` | Get image metadata (EXIF data, dimensions, etc.) |
| `getVideoMetadata()` | Get video metadata (duration, dimensions, etc.)  |

---

### 🗂️ **Folder Operations**

| Method                | Description                             |
| --------------------- | --------------------------------------- |
| `createFolder()`      | Create a new folder                     |
| `deleteFolder()`      | Delete an existing folder               |
| `getFolderIdByName()` | Fetch folder ID by its name             |
| `listFoldersByName()` | List all folders with a specific name   |
| `listAllFolders()`    | List all folders in Drive               |
| `listFilesInFolder()` | List all files within a specific folder |
| `listFoldersInFolder()` | List all folders within a specific folder |

---

### 🔍 **Search Operations**

| Method                  | Description                            |
| ----------------------- | -------------------------------------- |
| `searchByName()`        | Search files containing a name         |
| `searchByExactName()`   | Search files matching exact name       |
| `searchByType()`        | Search by file type (e.g., PDF, image) |
| `searchModifiedAfter()` | Find files modified after a given date |
| `searchStarredFiles()`  | List all starred files                 |
| `searchSharedFiles()`   | Find files shared with you             |
| `searchByContent()`     | Search within file content             |

---

### 📋 **List Operations**

| Method              | Description                           |
| ------------------- | ------------------------------------- |
| `listFiles()`       | List all files in Drive               |
| `listRecentFiles()` | List recently modified or added files |
| `listPDFs()`        | List all PDF files                    |
| `listImages()`      | List all image files                  |
| `listVideos()`      | List all video files                  |
| `listAudios()`      | List all audio files                  |
| `listArchives()`    | List all archive files                |
| `listJSONs()`       | List all json files                   |
| `listSheets()`      | List all sheet files                  |
| `listPresentations()`| List all presentation files           |
| `listDocs()`        | List all docs files                   |

---

### 🧩 **Batch Operations**

| Method                    | Description                          |
| ------------------------- | ------------------------------------ |
| `uploadMultipleFiles()`   | Upload multiple files at once        |
| `deleteMultipleFiles()`   | Delete multiple files simultaneously |
| `downloadMultipleFiles()` | Download multiple files in parallel  |

---

### 🧰 **Utility Operations**

| Method                | Description                 |
| --------------------- | --------------------------- |
| `shareFile()`        | Share a file with a user      |
| `fileExists()`        | Check if a file exists      |
| `getStorageQuota()`   | Get storage quota information |
| `createStream()`      | Create stream for any Google Drive file (audio, video, image, doc, etc.) |


---

### ❴❵ **Json Operation**

| Method                  | Description                               |
| ----------------------- | ----------------------------------------- |
| `createJsonFile()`      | Create a new JSON file                    |
| `readJsonFileData()`    | Read JSON file content                    |
| `addJsonKeyValue()`     | Add a new key-value pair to a JSON file   |
| `updateJsonFieldAndValues()`     | Update an existing field in a JSON file   |
| `deleteJsonFieldAndKeys()`     | Delete a field from a JSON file           |

---

### ⚞ **Conversion Operation**

| Method                  | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `convertTextToDocs()`   | Convert a text file (`.txt`) to Google Docs format        |
| `convertDocsToPdf()`    | Convert a Google Docs file to PDF                         |
| `convertDocsToWord()`   | Convert a Google Docs file to Microsoft Word (`.docx`)    |
| `convertDocsToText()`   | Convert a Google Docs file to plain text (`.txt`)         |
| `convertCsvToSheet()`   | Convert a CSV file to Google Sheets                       |
| `convertExcelToSheet()` | Convert an Excel file (`.xlsx`) to Google Sheets          |
| `convertSheetToCsv()`   | Convert a Google Sheet to CSV                             |
| `convertSheetToPdf()`   | Convert a Google Sheet to PDF                             |
| `convertPptToSlides()`  | Convert a PowerPoint file (`.pptx`) to Google Slides      |
| `convertSlidesToPpt()`  | Convert a Google Slides file to PowerPoint (`.pptx`)      |
| `convertSlidesToPdf()`  | Convert a Google Slides file to PDF                       |
| `convertPdfToDocs()`    | Convert a PDF file to Google Docs (with OCR if supported) |
| `convertDrawingToPng()` | Convert a Google Drawing to PNG image                     |
| `convertDrawingToPdf()` | Convert a Google Drawing to PDF                           |


---

### ⚡ Example: Upload a File

```ts
await operations.uploadFile({
  name: "report.pdf",
  path: "./files/report.pdf",
  mimeType: "application/pdf",
});
```

---

### ⚡ Example: Search and Download

```ts
const files = await operations.searchByName("invoice");
if (files?.data?.files?.length) {
  await operations.downloadFile(files.data.files[0].id, "./downloads/invoice.pdf");
}
```

---

### ⚡ Example: Add a Key-Value Pair to a JSON File

```ts
const fileId = "1234567890abcdef1234567890abcdef";
const addResult = await operations.addJsonKeyValue(
  fileId,
  "alive",
  true
);

if (addResult.success) {
  console.log("✅ Added new key-value pair successfully");
} else {
  console.error("❌ Failed:", addResult.error);
}
```

---

### ⚡ Example: Get Metadata

```ts
const fileId = "1234567890abcdef1234567890abcdef";
const metadataResult = await operations.getImageMetadata(fileId);

if (metadataResult.success) {
  console.log("✅ Image Metadata:", metadataResult.data);
} else {
  console.error("❌ Failed:", metadataResult.error);
}
```

---

### 🧑‍💻 Author

**Vikash Khati**
[GitHub](https://github.com/vikashkhati007) • [NPM](https://www.npmjs.com/~vikashkhati007)

---

### ⚖️ License

**MIT License** — free to use, modify, and distribute.

---
