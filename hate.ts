import * as operations from "./operations";
import { initDriveService } from "./drivers/services";

async function main() {
  initDriveService();
  //   const data = await operations.searchByName("icon");
  //   console.log(data)
  operations.watchFolderEvent(
    "1IAivwrXO6EKQdRJ1S30KOvjRnL0V7Trh",
    3000,
    (e) => {
      console.log("Basic:", e.type, e.file.name);
    }
  );
}
main();
