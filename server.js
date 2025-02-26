// Simple Express server to serve the SvelteKit app
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const express = require('express');
const path = require('path');
const { fileURLToPath } = require('url');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// For all GET requests, send back the SvelteKit index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 