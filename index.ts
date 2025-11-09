import updateNotifier from "update-notifier";
import pkg from "./package.json" assert { type: "json" };

// check update
const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 12,
});

if (notifier.update) {
  console.log(`
🚀  New version available for ${pkg.name}!
${notifier.update.current} → ${notifier.update.latest}
Run: npm i -g ${pkg.name} to update.
`);
}

import * as operations from "./operations";
import { generateCredentialsAndTokens } from "./auth";
import { initDriveService } from "./drivers/services";
export { generateCredentialsAndTokens, operations, initDriveService };
