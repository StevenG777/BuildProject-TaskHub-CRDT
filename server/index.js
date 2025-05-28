// Import modules
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOrCreateDocAndToken} from '@y-sweet/sdk';
import { CONNECTION_STRING } from './serverCredential.js';


// Retrieve the current file absolute URL (through metadata ESM way) and convert it to a path
const __filename = fileURLToPath(import.meta.url);
// Retrieve the current directory path name from the file path
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Allow cross-origin requests
app.use(cors());

// Serve the front-end static content
const staticPath = path.join(__dirname, '../client/dist');
app.use(express.static(staticPath));

console.log(`URL is ${import.meta.url}`);
console.log(`Path is ${__filename}`);
console.log(`Directory is ${__dirname}`);
console.log(`Static Path is ${staticPath}`);

// Responds with API endpoint: /client-token with client token to client    
app.get('/client-token', async(req, res) => {
    // Parse request input docId
    let docId = req.query.doc || undefined;
  
    if (docId === undefined) {
        console.log('[Server] Message: Recived client token request for a new doc');
    } else {
        console.log('[Server] Message: Recived client token request for doc', docId);
    }

    try {
        // Send a request as a client to Y-Sweet Y-Web-Socket cloud server
        const clientToken = await getOrCreateDocAndToken(CONNECTION_STRING, docId);
        // Send a response back to its client
        res.send(clientToken);
    } catch (error) {
        console.error('[Server] Error while getting client token:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Responds with to API endpoint: Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Listens on PORT 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});