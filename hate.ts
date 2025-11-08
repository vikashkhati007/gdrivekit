import { MIME_TYPES } from "./types";

import { initDriveService } from "./drivers/services";
import { driveOperations } from "./operations";

async function main(){
    initDriveService();
    const converted = await driveOperations.convertDocsToPdf("1t7pu8oK14Ii-LMvfn2Rp-6hsyZiuSUwbkxHs_KOwPAs");
    console.log(converted);
}

main();