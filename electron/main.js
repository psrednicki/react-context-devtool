const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const WebSocket = require('ws');

// Keep a global reference of the window object
let mainWindow;
let wsServer;
let connectedClients = new Set();

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window controls for frameless window
  mainWindow.webContents.on('dom-ready', () => {
    if (process.platform === 'darwin') {
      mainWindow.webContents.insertCSS(`
        .titlebar-drag-region {
          -webkit-app-region: drag;
        }
        .titlebar-no-drag {
          -webkit-app-region: no-drag;
        }
      `);
    }
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Connect to React App',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            showConnectionDialog();
          }
        },
        {
          label: 'Disconnect',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            disconnectFromApp();
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About React Context DevTool',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'React Context DevTool',
              detail: 'Standalone desktop application for debugging React Context and useReducer.\n\nVersion: 1.0.0'
            });
          }
        },
        {
          label: 'Documentation',
          click: () => {
            require('electron').shell.openExternal('https://github.com/deeppatel234/react-context-devtool');
          }
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function startWebSocketServer(port = 8097) {
  if (wsServer) {
    wsServer.close();
  }

  wsServer = new WebSocket.Server({ port });
  
  console.log(`WebSocket server started on port ${port}`);

  wsServer.on('connection', (ws, req) => {
    console.log('New WebSocket connection from:', req.socket.remoteAddress);
    connectedClients.add(ws);

    // Send connection status to renderer
    if (mainWindow) {
      mainWindow.webContents.send('connection-status', {
        connected: true,
        clientCount: connectedClients.size
      });
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data.type);

        // Forward to renderer process
        if (mainWindow) {
          mainWindow.webContents.send('websocket-message', data);
        }

        // Handle specific message types
        switch (data.type) {
          case 'react-context-devtool-handshake':
            ws.send(JSON.stringify({
              type: 'handshake-response',
              status: 'connected',
              message: 'Connected to React Context DevTool'
            }));
            break;

          case 'react-context-devtool-data':
            // Forward context data to renderer
            if (mainWindow) {
              mainWindow.webContents.send('context-data', data.payload);
            }
            break;
        }

      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      connectedClients.delete(ws);
      
      if (mainWindow) {
        mainWindow.webContents.send('connection-status', {
          connected: connectedClients.size > 0,
          clientCount: connectedClients.size
        });
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });
  });

  wsServer.on('error', (error) => {
    console.error('WebSocket server error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('server-error', error.message);
    }
  });
}

function showConnectionDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Connect to React App',
    message: 'Connection Instructions',
    detail: `To connect your React app to this DevTool:

1. Install the React Context DevTool extension in your browser
2. Go to extension settings
3. Select "Standalone Connection"
4. Set port to 8097
5. Click "Connect"

Or add this to your React app:
import { connectToDevTools } from 'react-context-devtool';
connectToDevTools('ws://localhost:8097');`,
    buttons: ['OK', 'Copy Connection Code']
  }).then((result) => {
    if (result.response === 1) {
      require('electron').clipboard.writeText("import { connectToDevTools } from 'react-context-devtool';\nconnectToDevTools('ws://localhost:8097');");
    }
  });
}

function disconnectFromApp() {
  if (wsServer) {
    connectedClients.forEach(ws => {
      ws.close();
    });
    connectedClients.clear();
    
    if (mainWindow) {
      mainWindow.webContents.send('connection-status', {
        connected: false,
        clientCount: 0
      });
    }
  }
}

// IPC handlers
ipcMain.handle('start-server', async (event, port) => {
  try {
    startWebSocketServer(port);
    return { success: true, port };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-server', async () => {
  try {
    if (wsServer) {
      wsServer.close();
      wsServer = null;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-server-status', async () => {
  return {
    running: !!wsServer,
    clientCount: connectedClients.size,
    port: wsServer ? wsServer.options.port : null
  };
});

ipcMain.handle('send-to-clients', async (event, data) => {
  const message = JSON.stringify(data);
  connectedClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
  return { success: true, clientCount: connectedClients.size };
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  // Don't auto-start server - let user choose port and start manually
  console.log('React Context DevTool ready - waiting for user to start server');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (wsServer) {
    wsServer.close();
  }
});