import { driveService, initDriveService } from "./drivers/services";
import { driveOperations } from "./operations";

async function main() {
  try {
    // Initialize drive service
    initDriveService();

    // Search file
    const searchRes = await driveOperations.getFileIdByName("data.json");

    if (!searchRes.success || !searchRes.fileId) {
      console.error("❌ data.json not found in Drive");
      return;
    }

    const deleteRes = await driveOperations.deleteJsonFieldAndKeys(
      searchRes.fileId,
      "0", // root array path
    );
    console.log(deleteRes);

    // Push new object to root array
    const pushRes = await driveOperations.pushJsonObjectToArray(
      searchRes.fileId,
      "", // root array path
      {
        id: 3,
        name: "Gamer",
        email: "Gamer@example.com",
        address: {
          city: "Los Angeles",
          state: "CA",
          zip: "90001",
        },
      }
    );

    if (pushRes.success) {
      console.log("✅ New object pushed successfully!");
    } else {
      console.error("❌ Failed to push object:", pushRes.error);
    }

    // Fetch updated data
    const search = await driveOperations.selectJsonContent(searchRes.fileId);
    if (search && search.success) {
      console.log(search.data);
    } else {
      console.error("❌ Failed to read updated file");
    }

  } catch (err: any) {
    console.error("💥 Unexpected Error:", err.message);
  }
}

main();
