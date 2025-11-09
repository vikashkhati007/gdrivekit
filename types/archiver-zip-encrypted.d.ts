declare module "archiver-zip-encrypted" {
  import { Archiver } from "archiver";

  export interface ZipEncryptedOptions {
    zlib?: { level?: number };
    encryptionMethod?: "zip20" | "aes128" | "aes192" | "aes256";
    password?: string;
  }

  export default function zipEncrypted(options?: ZipEncryptedOptions): Archiver;
}
