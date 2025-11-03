import { GoogleDriveService } from "./GoogleDriveService";
import type { GoogleCredentials, TokenData } from "./types";
import fs from "fs";
// Load credentials from credentials.json
const credentials: GoogleCredentials = JSON.parse(
  fs.readFileSync("./credentials.json", "utf-8")
);

// Initialize the service
export const driveService = new GoogleDriveService(credentials);

// Set tokens (you'll get these from OAuth2 flow)
const tokens: TokenData = JSON.parse(fs.readFileSync("./tokens.json", "utf-8"));
driveService.setCredentials(tokens);
