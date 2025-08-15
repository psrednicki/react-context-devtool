import React, { useState, useEffect } from "react";
import Button from "Components/Button";

const StandaloneConnection = () => {
  const [connectionMode, setConnectionMode] = useState("extension");
  const [port, setPort] = useState("8097");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [websocket, setWebsocket] = useState(null);

  useEffect(() => {
    // Load saved settings
    chrome.storage.local.get(
      ["connectionMode", "standalonePort"],
      function (result) {
        if (result.connectionMode) {
          setConnectionMode(result.connectionMode);
        }
        if (result.standalonePort) {
          setPort(result.standalonePort);
        }
      }
    );
  }, []);

  const onChangeConnectionMode = (event) => {
    setConnectionMode(event.target.value);
    if (event.target.value === "extension" && websocket) {
      websocket.close();
      setWebsocket(null);
      setIsConnected(false);
    }
  };

  const onChangePort = (event) => {
    setPort(event.target.value);
  };

  const connectToStandalone = async () => {
    setConnectionStatus("Connecting...");
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: "CONNECT_STANDALONE",
        port: parseInt(port)
      });
      
      if (response.isConnected) {
        setIsConnected(true);
        setConnectionStatus("Connected");
      } else {
        setIsConnected(false);
        setConnectionStatus("Connection failed");
      }
    } catch (error) {
      setConnectionStatus("Connection failed");
      console.error("Failed to connect to standalone:", error);
    }
  };

  const disconnect = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "DISCONNECT_STANDALONE"
      });
      
      setIsConnected(false);
      setConnectionStatus("Disconnected");
      setWebsocket(null);
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const saveSettings = () => {
    const settingsToSave = {
      connectionMode,
      standalonePort: port,
    };

    chrome.storage.local.set(settingsToSave, () => {
      setConnectionStatus("Settings saved");
      setTimeout(() => {
        setConnectionStatus("");
      }, 2000);
    });
  };

  return (
    <div className="setting-section">
      <div className="setting-section-label">Connection Mode</div>
      <div className="setting-section-value">
        <div className="setting-radio-wrapper">
          <input
            type="radio"
            id="extension"
            name="connectionMode"
            value="extension"
            className="setting-radio"
            checked={connectionMode === "extension"}
            onChange={onChangeConnectionMode}
          />
          <label htmlFor="extension" className="setting-radio-label">
            Browser Extension
            <div className="light-text">
              Use the browser extension to debug React Context (default)
            </div>
          </label>
        </div>
        <div className="setting-radio-wrapper">
          <input
            type="radio"
            id="standalone"
            name="connectionMode"
            value="standalone"
            className="setting-radio"
            checked={connectionMode === "standalone"}
            onChange={onChangeConnectionMode}
          />
          <label htmlFor="standalone" className="setting-radio-label">
            Standalone Connection
            <div className="light-text">
              Connect to a standalone React DevTools instance via WebSocket
            </div>
          </label>
        </div>
      </div>

      {connectionMode === "standalone" && (
        <div className="standalone-settings">
          <div className="setting-section">
            <div className="setting-section-label">Port</div>
            <div className="setting-section-value">
              <input
                type="number"
                value={port}
                onChange={onChangePort}
                placeholder="8097"
                min="1024"
                max="65535"
                className="port-input"
              />
              <div className="light-text">
                Port number for standalone React DevTools (default: 8097)
              </div>
            </div>
          </div>

          <div className="connection-controls">
            {!isConnected ? (
              <Button onClick={connectToStandalone}>Connect</Button>
            ) : (
              <Button onClick={disconnect} variant="secondary">Disconnect</Button>
            )}
            <Button onClick={saveSettings}>Save Settings</Button>
          </div>

          {connectionStatus && (
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {connectionStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StandaloneConnection;