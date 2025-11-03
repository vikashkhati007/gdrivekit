import fs from "fs";

const clientId = process.env.GOOGLE_CLIENT_ID!;
const projectId = process.env.GOOGLE_PROJECT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const redirectUris = [
    process.env.GOOGLE_REDIRECT_URI! || "http://localhost:3000/oauth2callback", "http://localhost:3000/oauth2/callback",
];

const credentials = {
  web: {
    client_id: clientId,
    project_id: projectId,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: clientSecret,
    redirect_uris: [
      "http://localhost:3000/oauth2callback",
      "http://localhost:3000/oauth2/callback",
    ],
    javascript_origins: ["http://localhost:3000"],
  },
};

async function createCredentialsJson() {
  fs.writeFileSync("credentials.json", JSON.stringify(credentials, null, 2));
  console.log("✅ credentials.json created successfully!");
}

export default createCredentialsJson;
