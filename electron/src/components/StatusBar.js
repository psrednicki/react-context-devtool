import React from 'react';

const StatusBar = ({ serverStatus, connectionStatus, contextData }) => {
  const getServerStatusText = () => {
    if (!serverStatus.running) return 'Server: Stopped';
    return `Server: Running on port ${serverStatus.port}`;
  };

  const getConnectionStatusText = () => {
    if (!serverStatus.running) return 'No connections';
    if (connectionStatus.clientCount === 0) return 'Waiting for connections';
    return `${connectionStatus.clientCount} client${connectionStatus.clientCount !== 1 ? 's' : ''} connected`;
  };

  const getDataStatusText = () => {
    const contextCount = contextData.contextKeys?.length || 0;
    const reducerCount = contextData.useReducerKeys?.length || 0;
    
    if (contextCount === 0 && reducerCount === 0) {
      return 'No data received';
    }
    
    const parts = [];
    if (contextCount > 0) parts.push(`${contextCount} Context${contextCount !== 1 ? 's' : ''}`);
    if (reducerCount > 0) parts.push(`${reducerCount} useReducer${reducerCount !== 1 ? 's' : ''}`);
    
    return parts.join(', ');
  };

  const getReactVersionText = () => {
    if (contextData.reactInfo?.version) {
      return `React ${contextData.reactInfo.version}`;
    }
    return 'React version unknown';
  };

  const getMemoryUsage = () => {
    if (window.electronAPI?.versions) {
      // This would need to be implemented in the main process
      return 'Memory: N/A';
    }
    return '';
  };

  return (
    <div className="status-bar">
      <div className="status-section">
        <span className="status-item server-status">
          <span className={`status-dot ${serverStatus.running ? 'running' : 'stopped'}`}></span>
          {getServerStatusText()}
        </span>
      </div>
      
      <div className="status-section">
        <span className="status-item connection-status">
          <span className="status-icon">🔗</span>
          {getConnectionStatusText()}
        </span>
      </div>
      
      <div className="status-section">
        <span className="status-item data-status">
          <span className="status-icon">📊</span>
          {getDataStatusText()}
        </span>
      </div>
      
      <div className="status-section">
        <span className="status-item react-version">
          <span className="status-icon">⚛️</span>
          {getReactVersionText()}
        </span>
      </div>
      
      <div className="status-section status-right">
        <span className="status-item app-version">
          v1.0.0
        </span>
        
        {window.electronAPI?.platform && (
          <span className="status-item platform">
            {window.electronAPI.platform}
          </span>
        )}
        
        {window.electronAPI?.versions?.electron && (
          <span className="status-item electron-version">
            Electron {window.electronAPI.versions.electron}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatusBar;