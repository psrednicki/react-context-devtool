import React from 'react';

const Header = ({ serverStatus, connectionStatus }) => {
  const getStatusColor = () => {
    if (!serverStatus.running) return '#ff4757'; // Red
    if (connectionStatus.connected) return '#2ed573'; // Green
    return '#ffa502'; // Orange
  };

  const getStatusText = () => {
    if (!serverStatus.running) return 'Server Stopped';
    if (connectionStatus.connected) return `Connected (${connectionStatus.clientCount} client${connectionStatus.clientCount !== 1 ? 's' : ''})`;
    return 'Waiting for connections...';
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#6176ff"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/>
          </svg>
        </div>
        <div className="app-title">
          <h1>React Context DevTool</h1>
          <span className="app-subtitle">Standalone Desktop Application</span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="connection-info">
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor() }}
          ></div>
          <span className="status-text">{getStatusText()}</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="server-info">
          {serverStatus.running && (
            <>
              <span className="port-info">Port: {serverStatus.port}</span>
              <span className="protocol-info">WebSocket</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;