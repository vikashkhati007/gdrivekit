import {generateCredentialsAndTokens, operations } from "gdrivejs";
import { initDriveService } from "./drivers/services";

async function main(){
  // await generateCredentialsAndTokens({
  //   clientid: process.env.GOOGLE_CLIENT_ID!,
  //   projectid: process.env.GOOGLE_PROJECT_ID!,
  //   clientsecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   redirecturis: ["http://localhost:3000/oauth2callback"],
  // });
  initDriveService();
  const drivers = await operations.searchByName("test");
  console.log(drivers.data?.files);
};

main();