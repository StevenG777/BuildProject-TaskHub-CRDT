// Import modules
import express from 'express';
import cors from 'cors';
import { getOrCreateDocAndToken} from '@y-sweet/sdk';
import { CONNECTION_STRING } from './serverCredential.js';

// Initialize Express app
const app = express();

// App serve the Front-App Static Website
app.use(express.static('../client/dist'));

// App uses the cors middleware to allow cross-origin requests
app.use(cors());

// App responds to API endpoint: /client-token with client token to client    
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
})

// App listens on PORT 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});