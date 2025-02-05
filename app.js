const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve chat.html when the root is accessed
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, 'chat.html'));
}

app.get('/', chatApp);

// Initialize EventEmitter for chat messages
const chatEmitter = new EventEmitter();

// Handle incoming chat messages
app.get('/chat', (req, res) => {
  const { message } = req.query;
  chatEmitter.emit('message', message);
  res.end(); // Send an empty response to acknowledge receipt
});

// Server-Sent Events (SSE) endpoint to broadcast messages
app.get('/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`); // Send message to client
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage); // Clean up event listener on connection close
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});