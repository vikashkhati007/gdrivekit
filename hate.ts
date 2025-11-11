import * as operations from './operations';
import { initDriveService } from "./drivers/services";

async function main(){
    initDriveService();
    const fileTypeBreakdown = await operations.getAllFilesInParent("15RyBXGhSzh1dNFXror0YdCAaB4i3tBvg");
    console.log(fileTypeBreakdown);
}
main();