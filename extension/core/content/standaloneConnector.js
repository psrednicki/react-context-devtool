// Standalone WebSocket connector for content script context
// This runs in the page context where WebSocket is available

class StandaloneConnector {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.port = 8097;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    
    // Listen for messages from background script
    this.setupMessageListener();
  }

  setupMessageListener() {
    // Listen for messages from background script
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      
      if (event.data.source === 'react-context-devtool-background') {
        this.handleBackgroundMessage(event.data);
      }
    });
  }

  handleBackgroundMessage(message) {
    switch (message.type) {
      case 'CONNECT_STANDALONE':
        this.connect(message.port);
        break;
      case 'DISCONNECT_STANDALONE':
        this.disconnect();
        break;
      case 'SEND_DATA':
        this.send(message.data);
        break;
      default:
        console.log('Unknown message from background:', message.type);
    }
  }

  async connect(port = 8097) {
    this.port = port;
    
    if (this.websocket) {
      this.websocket.close();
    }

    try {
      console.log(`Connecting to standalone React DevTools on ws://localhost:${port}`);
      this.websocket = new WebSocket(`ws://localhost:${port}`);
      
      this.websocket.onopen = () => {
        console.log("Connected to standalone React DevTools");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send handshake
        this.send({
          type: "react-context-devtool-handshake",
          source: "react-context-devtool-extension",
          version: "4.4"
        });
        
        // Notify background script
        this.notifyBackground('CONNECTION_STATUS', {
          isConnected: true,
          port: this.port
        });
      };

      this.websocket.onclose = (event) => {
        console.log("Disconnected from standalone React DevTools");
        this.isConnected = false;
        this.websocket = null;
        
        // Notify background script
        this.notifyBackground('CONNECTION_STATUS', {
          isConnected: false,
          port: this.port
        });
        
        // Attempt to reconnect if it wasn't a manual disconnect
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            this.connect(this.port);
          }, this.reconnectDelay);
        }
      };

      this.websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnected = false;
        
        // Notify background script
        this.notifyBackground('CONNECTION_STATUS', {
          isConnected: false,
          port: this.port,
          error: error.message
        });
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.isConnected = false;
      
      // Notify background script
      this.notifyBackground('CONNECTION_STATUS', {
        isConnected: false,
        port: this.port,
        error: error.message
      });
    }
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close(1000); // Normal closure
      this.websocket = null;
      this.isConnected = false;
    }
  }

  send(data) {
    if (this.websocket && this.isConnected) {
      try {
        this.websocket.send(JSON.stringify(data));
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case "handshake-response":
        console.log("Handshake successful with standalone React DevTools");
        break;
        
      case "react-context-data":
        // Forward to background script
        this.notifyBackground('STANDALONE_DATA_RECEIVED', data.payload);
        break;
        
      default:
        console.log("Unknown message type from standalone:", data.type);
    }
  }

  notifyBackground(type, data) {
    // Send message to background script via content script
    window.postMessage({
      source: 'react-context-devtool-standalone',
      type: type,
      data: data
    }, '*');
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      port: this.port,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Initialize standalone connector
if (typeof window !== 'undefined' && !window.__REACT_CONTEXT_DEVTOOL_STANDALONE_CONNECTOR__) {
  try {
    window.__REACT_CONTEXT_DEVTOOL_STANDALONE_CONNECTOR__ = new StandaloneConnector();
    console.log("React Context DevTool standalone connector initialized");
  } catch (error) {
    console.error("Failed to initialize standalone connector:", error);
  }
}