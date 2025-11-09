import * as operations from "./operations";
import { initDriveService } from "./drivers/services";

async function main() {
  initDriveService();
  const res = await operations.filesAndFoldersToZip({
        fileIds: ["1fYxhIa4QzcHosZ373Dr5F-TqnmBgz1VwqPku6kpvEUs"],
        zipName: "hello.zip",
        uploadToFolderId: undefined,
        password: "3333",
    });
    console.log(res);
}
main();