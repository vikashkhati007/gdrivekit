import { initDriveService } from "./drivers/services";
import {
  createGoogleScript,
  deployGoogleScript,
} from "./operations";

async function main() {
  initDriveService(); // load credentials + tokens

  // Step 1 → Create Script
  const created = await createGoogleScript(
    "MyScriptDemo",
    `function hello(name) { return "Hello " + name; }`
  );

  console.log("Created:", created);

  // Step 2 → Deploy Script
  const deployed = await deployGoogleScript(created.scriptId);
  console.log("Deployed:", deployed);


}

main();
