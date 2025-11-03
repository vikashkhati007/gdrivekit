import { driveOperations } from "./operations/operations";

async function main(): Promise<void> {
  try {
    // const result = await driveOperations.searchByName('uploaded');
    // console.log(result.data?.files);
    const fileName = 'test.txt';
    const folderName = 'Icons';
    const result = await driveOperations.searchByName(fileName);
    console.log(result);

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main().catch((error: Error) => {
    console.error("Fatal error:", error.message);
    process.exit(1);
  });
}
