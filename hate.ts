import * as operations from "./operations";
import { initDriveService } from "./drivers/services";

async function main() {
  initDriveService();
  const res = await operations.findDuplicateFilesAndFolders();
  console.log(res);
}
main();