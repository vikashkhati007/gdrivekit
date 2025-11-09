export const MIME_TYPES = {
  // Google Workspace
  FOLDER: 'application/vnd.google-apps.folder',
  DOCUMENT: 'application/vnd.google-apps.document',
  SPREADSHEET: 'application/vnd.google-apps.spreadsheet',
  PRESENTATION: 'application/vnd.google-apps.presentation',
  FORM: 'application/vnd.google-apps.form',
  DRAWING: 'application/vnd.google-apps.drawing',
  
  // Documents
  PDF: 'application/pdf',
  WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  POWERPOINT: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TEXT: 'text/plain',
  CSV: 'text/csv',
  JSON: 'application/json',
  
  // Images
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
  
  // Video
  MP4: 'video/mp4',
  AVI: 'video/x-msvideo',
  MKV: 'video/x-matroska',
  WEBM: 'video/webm',
  
  // Audio
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  
  // Archives
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
} as const;