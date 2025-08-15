import { sendMessage } from "@ext-browser/messaging/background";

class StandaloneConnectionManager {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.port = 8097;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  async connect(port = 8097) {
    this.port = port;
    
    if (this.websocket) {
      this.websocket.close();
    }

    try {
      this.websocket = new WebSocket(`ws://localhost:${port}`);
      
      this.websocket.onopen = () => {
        console.log("Connected to standalone React DevTools");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send handshake
        this.send({
          type: "react-context-devtool-handshake",
          source: "react-context-devtool-extension",
          version: chrome.runtime.getManifest().version
        });
      };

      this.websocket.onclose = (event) => {
        console.log("Disconnected from standalone React DevTools");
        this.isConnected = false;
        this.websocket = null;
        
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

  async handleMessage(data) {
    switch (data.type) {
      case "react-context-data":
        // Forward context data to devtools panel
        try {
          await sendMessage("devtool:active", "STANDALONE_CONTEXT_DATA", data.payload);
        } catch (err) {
          console.log("Error forwarding to devtool:", err);
        }
        break;
        
      case "react-devtools-bridge":
        // Handle React DevTools bridge messages
        if (data.payload && data.payload.type === "fiber-data") {
          this.processReactFiberData(data.payload.data);
        }
        break;
        
      case "handshake-response":
        console.log("Handshake successful with standalone React DevTools");
        break;
        
      default:
        console.log("Unknown message type from standalone:", data.type);
    }
  }

  processReactFiberData(fiberData) {
    // Process React fiber data and extract context/useReducer information
    // This would need to be adapted based on how standalone React DevTools
    // sends fiber data
    
    if (fiberData.contexts || fiberData.reducers) {
      const contextData = {
        context: fiberData.contexts || {},
        useReducer: fiberData.reducers || {},
        contextKeys: Object.keys(fiberData.contexts || {}),
        useReducerKeys: Object.keys(fiberData.reducers || {}),
        reactInfo: fiberData.reactInfo || {}
      };
      
      // Forward to devtools
      this.forwardContextData(contextData);
    }
  }

  async forwardContextData(contextData) {
    try {
      await sendMessage("devtool:active", "CONTEXT_DATA", {
        tabId: "standalone",
        tab: { title: "Standalone React App" },
        ...contextData,
        isReactDetected: true
      });
    } catch (err) {
      console.log("Error forwarding context data:", err);
    }
  }

  // Send context data to standalone React DevTools
  sendContextData(contextData) {
    this.send({
      type: "react-context-devtool-data",
      payload: contextData
    });
  }

  // Send action dispatch to standalone React DevTools
  sendDispatchAction(action) {
    this.send({
      type: "react-context-devtool-dispatch",
      payload: action
    });
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      port: this.port,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export default StandaloneConnectionManager;