const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Server management
  startServer: (port) => ipcRenderer.invoke('start-server', port),
  stopServer: () => ipcRenderer.invoke('stop-server'),
  getServerStatus: () => ipcRenderer.invoke('get-server-status'),
  sendToClients: (data) => ipcRenderer.invoke('send-to-clients', data),

  // Event listeners
  onConnectionStatus: (callback) => {
    ipcRenderer.on('connection-status', (event, data) => callback(data));
  },
  onWebSocketMessage: (callback) => {
    ipcRenderer.on('websocket-message', (event, data) => callback(data));
  },
  onContextData: (callback) => {
    ipcRenderer.on('context-data', (event, data) => callback(data));
  },
  onServerError: (callback) => {
    ipcRenderer.on('server-error', (event, error) => callback(error));
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Platform info
  platform: process.platform,
  
  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Expose a limited API for React Context DevTool specific functionality
contextBridge.exposeInMainWorld('reactContextDevTool', {
  // Connection management
  connect: async (port = 8097) => {
    return await ipcRenderer.invoke('start-server', port);
  },
  
  disconnect: async () => {
    return await ipcRenderer.invoke('stop-server');
  },
  
  // Data handling
  sendContextData: async (data) => {
    return await ipcRenderer.invoke('send-to-clients', {
      type: 'react-context-data',
      payload: data
    });
  },
  
  sendDispatchAction: async (action) => {
    return await ipcRenderer.invoke('send-to-clients', {
      type: 'react-action-dispatch',
      payload: action
    });
  },
  
  // Status
  getStatus: async () => {
    return await ipcRenderer.invoke('get-server-status');
  },
  
  // Event handlers
  onDataReceived: (callback) => {
    ipcRenderer.on('context-data', (event, data) => callback(data));
  },
  
  onConnectionChange: (callback) => {
    ipcRenderer.on('connection-status', (event, status) => callback(status));
  },
  
  onError: (callback) => {
    ipcRenderer.on('server-error', (event, error) => callback(error));
  }
});

// Development helpers
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('devTools', {
    openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
    reload: () => ipcRenderer.invoke('reload'),
    log: (message) => console.log('[Preload]', message)
  });
}