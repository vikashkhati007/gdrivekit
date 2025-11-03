import { google } from 'googleapis';
import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import type { GoogleCredentials, TokenData } from './types';
import createCredentialsJson from './crediantialsGenerator';

export async function getAccessToken(): Promise<TokenData> {
  // Create Credentials.json file
  createCredentialsJson();
  
  const credentials: GoogleCredentials = JSON.parse(
    fs.readFileSync('./credentials.json', 'utf-8')
  );
  
  // Handle the web credentials format from Google Cloud Console
  const creds = credentials.web || credentials.installed || credentials;
  const { client_id, client_secret } = creds;
  const redirect_uri = 'redirect_uris' in creds 
    ? creds.redirect_uris[0] 
    : (credentials as any).redirect_uri;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
  );

  const scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Force to get refresh token
  });

  console.log('\n==================================');
  console.log('Authorize this app by visiting:');
  console.log(authUrl);
  console.log('==================================\n');

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url && req.url.indexOf('/oauth2callback') > -1) {
          const qs = new url.URL(req.url, redirect_uri).searchParams;
          const code = qs.get('code');
          
          if (!code) {
            throw new Error('No authorization code received');
          }
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body>
                <h1>Authentication successful! ✅</h1>
                <p>You can close this window and return to your terminal.</p>
                <script>window.close();</script>
              </body>
            </html>
          `);
          
          server.close();

          const { tokens } = await oauth2Client.getToken(code);
          fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2));
          
          console.log('\n✅ Tokens saved to tokens.json');
          console.log('You can now run: npm start\n');
          resolve(tokens as TokenData);
        }
      } catch (error) {
        reject(error);
      }
    }).listen(3000, () => {
      console.log('🚀 Waiting for authentication on http://localhost:3000');
    });

    // Handle server errors
    server.on('error', (error: Error) => {
      reject(error);
    });
  });
}

// Run if this is the main module
if (require.main === module) {
  getAccessToken()
    .then(() => process.exit(0))
    .catch((error: Error) => {
      console.error('Authentication error:', error.message);
      process.exit(1);
    });
}