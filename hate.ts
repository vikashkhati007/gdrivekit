import { initDriveService } from "./drivers/services";
import * as operations from "./operations";

async function main() {
  initDriveService();
  const plainText = 'Hello, World!';
  const password = 'mySecretPassword';
  const salt = process.env.SALT || 'mySecretSalt';

  const encryptedText = await operations.encryptText(plainText, password, salt);
  console.log('Encrypted Text:', encryptedText);

  const decryptedText = await operations.decryptText(encryptedText.data, password, salt);
  console.log('Decrypted Text:', decryptedText);
}

main().catch(console.error);