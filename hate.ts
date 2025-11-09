import { operations, initDriveService } from "gdrivekit";
async function main(){
    initDriveService();
    // Example: Create a zip file from multiple files
    const res = await operations.filesAndFoldersToZip({
        folderId: "1IAivwrXO6EKQdRJ1S30KOvjRnL0V7Trh",
        zipName: "taset.zip",
        uploadToFolderId: undefined,
        password: "1234",
    });
    console.log(res);
    //Example: Folder to zip
    // const res2 = await driveService.folderToZip("FolderID", "Hate.zip", undefined, "1234");
    // console.log(res2);
}

main();