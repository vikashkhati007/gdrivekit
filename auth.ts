import { google } from "googleapis";
import * as fs from "fs";
import * as http from "http";
import * as url from "url";
import type {
  CredentialsFileParams,
  GoogleCredentials,
  WebCredentials,
  InstalledCredentials,
  TokenData,
} from "./types";
import { SCOPES } from "./const";

const CREDENTIALS_PATH = "./credentials.json";
const TOKENS_PATH = "./tokens.json";

export async function generateCredentialsAndTokens({
  clientid,
  projectid,
  clientsecret,
  redirecturis,
  javascript_origin,
}: CredentialsFileParams) {
  // =====================================
  // 1️⃣ CREATE CREDENTIALS.JSON IF MISSING
  // =====================================
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    const baseCredentials = {
      web: {
        client_id: clientid!,
        project_id: projectid!,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: clientsecret!,
        redirect_uris: redirecturis || [
          "http://localhost:3000/oauth2callback",
          "http://localhost:3000/oauth2/callback",
        ],
        javascript_origins: javascript_origin || ["http://localhost:3000"],
      },
    };
    fs.writeFileSync(
      CREDENTIALS_PATH,
      JSON.stringify(baseCredentials, null, 2)
    );
    console.log("✅ Created credentials.json");
  }

  // =====================================
  // 2️⃣ READ CREDENTIALS
  // =====================================
  const credentials: GoogleCredentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf-8")
  );
  const creds = credentials.web || credentials.installed || credentials;

  const client_id = creds.client_id;
  const client_secret = creds.client_secret;
  const redirect_uri = Array.isArray(
    (creds as WebCredentials | InstalledCredentials).redirect_uris
  )
    ? (creds as WebCredentials | InstalledCredentials).redirect_uris[0]
    : (creds as GoogleCredentials).redirect_uri;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
  );

  // =====================================
  // 3️⃣ REUSE EXISTING TOKENS IF PRESENT
  // =====================================
  if (fs.existsSync(TOKENS_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf-8"));
    oauth2Client.setCredentials(tokens);
    console.log("✅ Using existing tokens from tokens.json");
    return oauth2Client;
  }

  // =====================================
  // 4️⃣ START NEW AUTH FLOW
  // =====================================

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: false, // 🔥 THIS IS THE MAIN FIX
    scope: SCOPES,
  });

  console.log("\n🌐 Authorize this app by visiting this URL:\n", authUrl, "\n");

  return new Promise((resolve, reject) => {
    const connections = new Set<any>();

    const server = http.createServer(async (req, res) => {
      try {
        if (req.url && req.url.includes("/oauth2callback")) {
          const qs = new url.URL(req.url, redirect_uri).searchParams;
          const code = qs.get("code");
          if (!code) throw new Error("No authorization code received");

          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);
          fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));

          console.log("✅ Tokens saved to tokens.json");

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body>
                <h1>✅ Authentication successful!</h1>
                <p>You can close this window and return to your terminal.</p>
                <script>window.close();</script>
              </body>
            </html>
          `);

          // Destroy all active connections and close the server
          connections.forEach((socket) => socket.destroy());
          server.close(() => {
            console.log("🔒 Server closed");
          });

          resolve(oauth2Client);
        }
      } catch (err) {
        connections.forEach((socket) => socket.destroy());
        server.close();
        reject(err);
      }
    });

    // Track all connections
    server.on("connection", (socket) => {
      connections.add(socket);
      socket.on("close", () => {
        connections.delete(socket);
      });
    });

    server.listen(3000, () => {
      console.log("🚀 Waiting for authentication on http://localhost:3000");
    });

    server.on("error", (err) => {
      connections.forEach((socket) => socket.destroy());
      server.close();
      reject(err);
    });
  });
}
