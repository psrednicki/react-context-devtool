import React, { useState } from 'react';

const ConnectionPanel = ({ 
  serverStatus, 
  connectionStatus, 
  onStartServer, 
  onStopServer,
  isSetupMode = false
}) => {
  const [port, setPort] = useState(serverStatus.port || 8097);
  const [isStarting, setIsStarting] = useState(false);
  const [connectionMode, setConnectionMode] = useState('start'); // 'start' or 'connect'
  const [connectPort, setConnectPort] = useState(8097);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStartServer = async () => {
    setIsStarting(true);
    try {
      await onStartServer(port);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopServer = async () => {
    await onStopServer();
  };

  const handleConnectToExisting = async () => {
    setIsConnecting(true);
    try {
      // Test connection to existing server
      const ws = new WebSocket(`ws://localhost:${connectPort}`);
      
      ws.onopen = () => {
        console.log(`Connected to existing server on port ${connectPort}`);
        // Send handshake
        ws.send(JSON.stringify({
          type: "react-context-devtool-handshake",
          source: "react-context-devtool-electron-client"
        }));
        
        // Notify parent component about successful connection
        if (window.electronAPI) {
          window.electronAPI.onWebSocketMessage({
            type: 'external-connection-established',
            port: connectPort,
            websocket: ws
          });
        }
        
        setIsConnecting(false);
      };
      
      ws.onerror = (error) => {
        console.error(`Failed to connect to port ${connectPort}:`, error);
        setIsConnecting(false);
        alert(`Failed to connect to server on port ${connectPort}. Make sure a React DevTools server is running.`);
      };
      
      ws.onclose = () => {
        console.log(`Connection to port ${connectPort} closed`);
        setIsConnecting(false);
      };
      
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnecting(false);
      alert(`Failed to connect: ${error.message}`);
    }
  };

  const copyConnectionCode = () => {
    const code = `// Add this to your React app
import { connectToDevTools } from 'react-context-devtool';
connectToDevTools('ws://localhost:${port}');`;
    
    navigator.clipboard.writeText(code).then(() => {
      // Could add a toast notification here
      console.log('Connection code copied to clipboard');
    });
  };

  const copyExtensionInstructions = () => {
    const instructions = `Extension Connection Instructions:

1. Install React Context DevTool browser extension
2. Open extension settings
3. Select "Standalone Connection"
4. Set port to ${port}
5. Click "Connect"`;
    
    navigator.clipboard.writeText(instructions).then(() => {
      console.log('Extension instructions copied to clipboard');
    });
  };

  if (isSetupMode) {
    return (
      <div className="connection-panel setup-mode">
        <div className="setup-panel-section">
          <div className="connection-mode-selector">
            <div className="mode-tabs">
              <button
                className={`mode-tab ${connectionMode === 'start' ? 'active' : ''}`}
                onClick={() => setConnectionMode('start')}
              >
                <span className="tab-icon">🚀</span>
                Start New Server
              </button>
              <button
                className={`mode-tab ${connectionMode === 'connect' ? 'active' : ''}`}
                onClick={() => setConnectionMode('connect')}
              >
                <span className="tab-icon">🔗</span>
                Connect to Existing
              </button>
            </div>
          </div>

          {connectionMode === 'start' ? (
            <>
              <div className="setup-form-group">
                <label htmlFor="setup-port">WebSocket Port:</label>
                <input
                  id="setup-port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value))}
                  disabled={serverStatus.running}
                  min="1024"
                  max="65535"
                  className="setup-port-input"
                  placeholder="8097"
                />
                <div className="port-help">
                  Choose a port between 1024-65535. Default is 8097.
                </div>
              </div>
              
              <div className="setup-server-controls">
                <button
                  onClick={handleStartServer}
                  disabled={isStarting}
                  className="btn btn-primary btn-large"
                >
                  {isStarting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Starting Server...
                    </>
                  ) : (
                    <>
                      <span className="start-icon">▶</span>
                      Start WebSocket Server
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="setup-form-group">
                <label htmlFor="connect-port">Connect to Port:</label>
                <input
                  id="connect-port"
                  type="number"
                  value={connectPort}
                  onChange={(e) => setConnectPort(parseInt(e.target.value))}
                  min="1024"
                  max="65535"
                  className="setup-port-input"
                  placeholder="8097"
                />
                <div className="port-help">
                  Connect to an existing React DevTools server (e.g., standalone React DevTools).
                </div>
              </div>
              
              <div className="setup-server-controls">
                <button
                  onClick={handleConnectToExisting}
                  disabled={isConnecting}
                  className="btn btn-primary btn-large"
                >
                  {isConnecting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <span className="start-icon">🔗</span>
                      Connect to Server
                    </>
                  )}
                </button>
              </div>
            </>
          )}
          
          <div className="setup-info">
            {connectionMode === 'start' ? (
              <>
                <div className="info-item">
                  <span className="info-icon">🌐</span>
                  <span>Server will be available at <code>ws://localhost:{port}</code></span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔗</span>
                  <span>React apps can connect via browser extension or direct integration</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">⚡</span>
                  <span>Real-time debugging of Context and useReducer</span>
                </div>
              </>
            ) : (
              <>
                <div className="info-item">
                  <span className="info-icon">🔍</span>
                  <span>Connect to existing server at <code>ws://localhost:{connectPort}</code></span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🚀</span>
                  <span>Works with standalone React DevTools or other servers</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">⚡</span>
                  <span>Receive real-time data from connected React applications</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="setup-connection-methods">
          {connectionMode === 'start' ? (
            <>
              <h4>How to Connect Your React App</h4>
              
              <div className="setup-method">
                <div className="method-header">
                  <span className="method-number">1</span>
                  <h5>Browser Extension (Recommended)</h5>
                </div>
                <div className="method-content">
                  <p>Use the React Context DevTool browser extension:</p>
                  <ol>
                    <li>Install the browser extension</li>
                    <li>Open extension settings</li>
                    <li>Select "Standalone Connection"</li>
                    <li>Set port to <strong>{port}</strong></li>
                    <li>Click "Connect"</li>
                  </ol>
                </div>
              </div>
              
              <div className="setup-method">
                <div className="method-header">
                  <span className="method-number">2</span>
                  <h5>Direct Integration</h5>
                </div>
                <div className="method-content">
                  <p>Add this code to your React app:</p>
                  <pre><code>{`// Add to your main app file
if (process.env.NODE_ENV === 'development') {
  import('react-context-devtool').then(({ connectToDevTools }) => {
    connectToDevTools('ws://localhost:${port}');
  });
}`}</code></pre>
                  <button
                    onClick={copyConnectionCode}
                    className="btn btn-outline btn-sm"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h4>Connect to Existing Server</h4>
              
              <div className="setup-method">
                <div className="method-header">
                  <span className="method-number">1</span>
                  <h5>Standalone React DevTools</h5>
                </div>
                <div className="method-content">
                  <p>Connect to the official standalone React DevTools:</p>
                  <ol>
                    <li>Install: <code>npm install -g react-devtools</code></li>
                    <li>Start: <code>react-devtools --port={connectPort}</code></li>
                    <li>Click "Connect to Server" above</li>
                    <li>Your React app will send data to both tools</li>
                  </ol>
                </div>
              </div>
              
              <div className="setup-method">
                <div className="method-header">
                  <span className="method-number">2</span>
                  <h5>Custom WebSocket Server</h5>
                </div>
                <div className="method-content">
                  <p>Connect to any WebSocket server that accepts React DevTools protocol:</p>
                  <ul>
                    <li>Server must be running on <code>ws://localhost:{connectPort}</code></li>
                    <li>Server should accept React DevTools handshake messages</li>
                    <li>Context data will be forwarded to the connected server</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="connection-panel">
      <div className="panel-section">
        <h3>Server Configuration</h3>
        
        <div className="form-group">
          <label htmlFor="port">WebSocket Port:</label>
          <input
            id="port"
            type="number"
            value={port}
            onChange={(e) => setPort(parseInt(e.target.value))}
            disabled={serverStatus.running}
            min="1024"
            max="65535"
            className="port-input"
          />
        </div>
        
        <div className="server-controls">
          {!serverStatus.running ? (
            <button
              onClick={handleStartServer}
              disabled={isStarting}
              className="btn btn-primary"
            >
              {isStarting ? 'Starting...' : 'Start Server'}
            </button>
          ) : (
            <button
              onClick={handleStopServer}
              className="btn btn-secondary"
            >
              Stop Server
            </button>
          )}
        </div>
      </div>

      {serverStatus.running && (
        <div className="panel-section">
          <h3>Connection Status</h3>
          
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Server:</span>
              <span className="status-value running">Running</span>
            </div>
            <div className="status-item">
              <span className="status-label">Port:</span>
              <span className="status-value">{serverStatus.port}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Clients:</span>
              <span className="status-value">{connectionStatus.clientCount}</span>
            </div>
            <div className="status-item">
              <span className="status-label">URL:</span>
              <span className="status-value">ws://localhost:{serverStatus.port}</span>
            </div>
          </div>
        </div>
      )}

      <div className="panel-section">
        <h3>Connection Methods</h3>
        
        <div className="connection-methods">
          <div className="method">
            <h4>Browser Extension</h4>
            <p>Use the React Context DevTool browser extension to connect.</p>
            <button
              onClick={copyExtensionInstructions}
              className="btn btn-outline"
            >
              Copy Instructions
            </button>
          </div>
          
          <div className="method">
            <h4>Direct Integration</h4>
            <p>Add connection code directly to your React application.</p>
            <button
              onClick={copyConnectionCode}
              className="btn btn-outline"
            >
              Copy Code
            </button>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h3>Quick Start</h3>
        <div className="quick-start-steps">
          <div className="step">
            <span className="step-number">1</span>
            <span className="step-text">Start the WebSocket server</span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span className="step-text">Connect your React app</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span className="step-text">Debug Context and useReducer</span>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h3>Troubleshooting</h3>
        <div className="troubleshooting">
          <details>
            <summary>Connection Issues</summary>
            <ul>
              <li>Check if port {port} is available</li>
              <li>Verify firewall settings</li>
              <li>Ensure React app is running</li>
              <li>Check browser console for errors</li>
            </ul>
          </details>
          
          <details>
            <summary>No Data Received</summary>
            <ul>
              <li>Verify React Context is being used</li>
              <li>Check if displayName is set on Context</li>
              <li>Ensure useReducer is in development mode</li>
              <li>Refresh the React application</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPanel;