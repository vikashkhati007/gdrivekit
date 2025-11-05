import { initDriveService } from "./drivers/services";
import { driveOperations } from "./operations";

async function main() {
  initDriveService();
  const search = await driveOperations.searchByName("test.json");
  if (search.success && search.data?.files?.length) {
    const fileId = search.data.files[0].id;
    const res = await driveOperations.updateJsonFieldAndValues(fileId, "fullname", undefined, "Vikash");
    const check = await driveOperations.readJsonFileData(fileId);
    console.log("📄 Updated JSON:", check.data);
  }
}

main();
