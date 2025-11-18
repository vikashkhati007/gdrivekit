import { generateCredentialsAndTokens } from "gdrivekit";

await generateCredentialsAndTokens({
  clientid: process.env.GOOGLE_CLIENT_ID!,
  projectid: process.env.GOOGLE_PROJECT_ID!,
  clientsecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirecturis: ["http://localhost:3000/oauth2callback"],
  javascriptorigins: ["http://localhost:3000"],
});