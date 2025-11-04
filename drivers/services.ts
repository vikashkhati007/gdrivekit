import type { GoogleCredentials, TokenData } from "../types";
import fs from "fs";
import { GoogleDriveService } from "./GoogleDriveService";

let driveService: GoogleDriveService;

export async function initDriveService(creds?: GoogleCredentials, tokens?: TokenData): Promise<GoogleDriveService> {
  if (!driveService) {
    const credentials: GoogleCredentials = creds ?? JSON.parse(fs.readFileSync("./credentials.json", "utf-8"));
    driveService = new GoogleDriveService(credentials);

    const tokenData: TokenData = tokens ?? JSON.parse(fs.readFileSync("./tokens.json", "utf-8"));
    driveService.setCredentials(tokenData);
  }
  return driveService;
}

export { driveService };
