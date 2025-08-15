import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ConnectionPanel from './components/ConnectionPanel';
import ContextViewer from './components/ContextViewer';
import StatusBar from './components/StatusBar';

const ElectronApp = () => {
  const [serverStatus, setServerStatus] = useState({
    running: false,
    port: 8097,
    clientCount: 0
  });
  
  const [contextData, setContextData] = useState({
    context: {},
    useReducer: {},
    contextKeys: [],
    useReducerKeys: [],
    reactInfo: {}
  });
  
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    clientCount: 0
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Get initial server status
      const status = await window.electronAPI.getServerStatus();
      setServerStatus(status);
      setLoading(false);
      
      // If server is not running, show connection controls prominently
      if (!status.running) {
        console.log('Server not running - showing connection controls');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setError('Failed to initialize application');
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    // Listen for connection status changes
    window.electronAPI.onConnectionStatus((status) => {
      setConnectionStatus(status);
      setServerStatus(prev => ({
        ...prev,
        clientCount: status.clientCount
      }));
    });

    // Listen for context data
    window.electronAPI.onContextData((data) => {
      setContextData(data);
    });

    // Listen for WebSocket messages
    window.electronAPI.onWebSocketMessage((message) => {
      console.log('WebSocket message:', message);
      
      switch (message.type) {
        case 'react-context-devtool-data':
          setContextData(message.payload);
          break;
        case 'react-context-devtool-handshake':
          console.log('Handshake received from:', message.source);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    });

    // Listen for server errors
    window.electronAPI.onServerError((error) => {
      setError(`Server error: ${error}`);
    });
  };

  const cleanupEventListeners = () => {
    window.electronAPI.removeAllListeners('connection-status');
    window.electronAPI.removeAllListeners('context-data');
    window.electronAPI.removeAllListeners('websocket-message');
    window.electronAPI.removeAllListeners('server-error');
  };

  const handleStartServer = async (port) => {
    try {
      setError(null);
      const result = await window.electronAPI.startServer(port);
      
      if (result.success) {
        setServerStatus({
          running: true,
          port: result.port,
          clientCount: 0
        });
      } else {
        setError(`Failed to start server: ${result.error}`);
      }
    } catch (error) {
      setError(`Failed to start server: ${error.message}`);
    }
  };

  const handleStopServer = async () => {
    try {
      setError(null);
      const result = await window.electronAPI.stopServer();
      
      if (result.success) {
        setServerStatus({
          running: false,
          port: 8097,
          clientCount: 0
        });
        setConnectionStatus({
          connected: false,
          clientCount: 0
        });
        setContextData({
          context: {},
          useReducer: {},
          contextKeys: [],
          useReducerKeys: [],
          reactInfo: {}
        });
      } else {
        setError(`Failed to stop server: ${result.error}`);
      }
    } catch (error) {
      setError(`Failed to stop server: ${error.message}`);
    }
  };

  const handleDispatchAction = async (action) => {
    try {
      await window.electronAPI.sendToClients({
        type: 'react-action-dispatch',
        payload: action
      });
    } catch (error) {
      setError(`Failed to dispatch action: ${error.message}`);
    }
  };

  const clearError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading React Context DevTool...</p>
      </div>
    );
  }

  return (
    <div className="electron-app">
      {window.electronAPI?.platform === 'darwin' && (
        <div className="titlebar-drag-region">
          React Context DevTool
        </div>
      )}
      
      <Header 
        serverStatus={serverStatus}
        connectionStatus={connectionStatus}
      />
      
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}
      
      <div className="app-content">
        {!serverStatus.running ? (
          // Show connection setup screen when server is not running
          <div className="connection-setup-screen">
            <div className="setup-content">
              <div className="setup-header">
                <div className="setup-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                    <path d="m21 12-6-3-6 3-6-3"/>
                  </svg>
                </div>
                <h2>Start WebSocket Server</h2>
                <p>Configure and start the WebSocket server to connect your React applications</p>
              </div>
              
              <div className="setup-form">
                <ConnectionPanel
                  serverStatus={serverStatus}
                  connectionStatus={connectionStatus}
                  onStartServer={handleStartServer}
                  onStopServer={handleStopServer}
                  isSetupMode={true}
                />
              </div>
            </div>
          </div>
        ) : (
          // Show normal layout when server is running
          <>
            <div className="sidebar">
              <ConnectionPanel
                serverStatus={serverStatus}
                connectionStatus={connectionStatus}
                onStartServer={handleStartServer}
                onStopServer={handleStopServer}
                isSetupMode={false}
              />
            </div>
            
            <div className="main-content">
              <ContextViewer
                contextData={contextData}
                onDispatchAction={handleDispatchAction}
              />
            </div>
          </>
        )}
      </div>
      
      <StatusBar
        serverStatus={serverStatus}
        connectionStatus={connectionStatus}
        contextData={contextData}
      />
    </div>
  );
};

export default ElectronApp;