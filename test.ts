import { initDriveService } from "./drivers/services";
import { driveOperations } from "./operations";

async function main() {
  initDriveService();
  const search = await driveOperations.searchByName("test.json");
  if (search.success && search.data?.files?.length) {
    const fileId = search.data.files[0].id;

    const addResult = await driveOperations.addJsonKeyValue(
      fileId,
      "alive",
      true
    );

    if (addResult.success) {
      console.log("✅ Added new key-value pair successfully");
    } else {
      console.error("❌ Failed:", addResult.error);
    }

    const updated = await driveOperations.readJsonFileData(fileId);
    console.log("📄 Updated JSON:", updated.data);
  } else {
    console.error("❌ test.json not found");
  }
}

main();
