import { MIME_TYPES } from "./types";

import { initDriveService } from "./drivers/services";
import { driveOperations } from "./operations";

async function main(){
    initDriveService();
    const gamer = [
        {name: "Vikash", age: 25},
        {name: "Ananya", age: 24},
    ]
    const converted = await driveOperations.createJsonFile(gamer, "nic.json");
    console.log(converted); 
}

main();