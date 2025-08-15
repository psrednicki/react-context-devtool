import { sendMessage } from "@ext-browser/messaging/background";

class StandaloneConnectionManager {
  constructor() {
    this.isConnected = false;
    this.port = 8097;
    this.currentTabId = null;
  }

  async connect(port = 8097) {
    this.port = port;
    
    try {
      // Get current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        throw new Error("No active tab found");
      }
      
      this.currentTabId = tabs[0].id;
      console.log(`Connecting to standalone React DevTools on port ${port} via tab ${this.currentTabId}`);
      
      // Send connection request to content script
      await sendMessage(`content:${this.currentTabId}`, "STANDALONE_CONNECT", { port });
      
      // Connection status will be updated via message from content script
      return { isConnected: false, connecting: true, port };
      
    } catch (error) {
      console.error("Failed to initiate connection:", error);
      this.isConnected = false;
      return { isConnected: false, error: error.message, port };
    }
  }

  async disconnect() {
    if (this.currentTabId) {
      try {
        await sendMessage(`content:${this.currentTabId}`, "STANDALONE_DISCONNECT");
      } catch (error) {
        console.error("Error sending disconnect message:", error);
      }
    }
    this.isConnected = false;
    this.currentTabId = null;
  }

  async send(data) {
    if (this.currentTabId && this.isConnected) {
      try {
        await sendMessage(`content:${this.currentTabId}`, "STANDALONE_SEND_DATA", data);
      } catch (error) {
        console.error("Error sending data to standalone:", error);
      }
    }
  }

  // Handle connection status updates from content script
  updateConnectionStatus(status) {
    this.isConnected = status.isConnected;
    if (status.port) {
      this.port = status.port;
    }
    console.log("Standalone connection status updated:", status);
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