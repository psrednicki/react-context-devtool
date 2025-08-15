const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const PORT = 8097;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

console.log(`React Context DevTool Standalone Server running on port ${PORT}`);
console.log(`WebSocket server: ws://localhost:${PORT}`);
console.log(`Web interface: http://localhost:${PORT + 1}`);

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data.type);

      switch (data.type) {
        case 'react-context-devtool-handshake':
          console.log('Handshake from React Context DevTool extension');
          ws.send(JSON.stringify({
            type: 'handshake-response',
            status: 'connected',
            message: 'Successfully connected to standalone React DevTools'
          }));
          break;

        case 'react-context-devtool-data':
          console.log('Context data received:', data.payload);
          // Broadcast to all connected clients (including other devtools)
          broadcastToClients({
            type: 'react-context-data',
            payload: data.payload
          }, ws);
          break;

        case 'react-context-devtool-dispatch':
          console.log('Action dispatch:', data.payload);
          // Forward action dispatch to React app
          broadcastToClients({
            type: 'react-action-dispatch',
            payload: data.payload
          }, ws);
          break;

        case 'react-app-data':
          // Data from React app, forward to devtools
          broadcastToClients({
            type: 'react-context-data',
            payload: data.payload
          }, ws);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

function broadcastToClients(message, sender) {
  const messageStr = JSON.stringify(message);
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Simple HTTP server for demo page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>React Context DevTool Standalone Server</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .connected { background: #e8f5e8; color: #2e7d32; }
        .disconnected { background: #ffebee; color: #c62828; }
        .log { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; font-family: monospace; }
      </style>
    </head>
    <body>
      <h1>React Context DevTool Standalone Server</h1>
      <div id="status" class="status disconnected">Server Status: Running on port ${PORT}</div>
      <div class="log">
        <h3>Instructions:</h3>
        <ol>
          <li>Open React Context DevTool extension in your browser</li>
          <li>Go to Settings and select "Standalone Connection"</li>
          <li>Set port to ${PORT}</li>
          <li>Click "Connect"</li>
          <li>Your React app should connect to ws://localhost:${PORT}</li>
        </ol>
      </div>
      <div class="log">
        <h3>Connected Clients:</h3>
        <div id="clients">0 clients connected</div>
      </div>
      
      <script>
        // Update client count
        const ws = new WebSocket('ws://localhost:${PORT}');
        ws.onopen = () => {
          document.getElementById('status').className = 'status connected';
          document.getElementById('status').textContent = 'WebSocket Status: Connected';
        };
        ws.onclose = () => {
          document.getElementById('status').className = 'status disconnected';
          document.getElementById('status').textContent = 'WebSocket Status: Disconnected';
        };
        
        setInterval(() => {
          document.getElementById('clients').textContent = '${clients.size} clients connected';
        }, 1000);
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT + 1, () => {
  console.log(`HTTP server running on http://localhost:${PORT + 1}`);
});