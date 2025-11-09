import { driveService, initDriveService } from "./drivers/services";

async function main(){
    initDriveService();
    // Example: Create a zip file from multiple files
    const res = await driveService.filesToZip(["FilesID"], "Hate.zip", undefined, "1234");
    console.log(res);
    //Example: Folder to zip
    const res2 = await driveService.folderToZip("FolderID", "Hate.zip", undefined, "1234");
    console.log(res2);
}

main();