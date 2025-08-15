# React Context DevTool - Electron Standalone

A standalone desktop application for debugging React Context and useReducer hooks, built with Electron.

## 🚀 Features

- **Standalone Desktop App**: No browser extension required
- **WebSocket Server**: Built-in server for React app connections
- **Real-time Debugging**: Live updates of Context and useReducer state
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Action Dispatching**: Send actions directly to useReducer hooks
- **State Diffing**: Visual comparison of state changes
- **JSON Editing**: Edit and dispatch custom actions

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Development Setup

```bash
# Navigate to electron directory
cd electron

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build renderer process
npm run build:renderer

# Build application
npm run build

# Create distributable packages
npm run dist
```

## 🔧 Usage

### Starting the Application

1. **Launch the app**:
   ```bash
   npm start
   ```

2. **The WebSocket server starts automatically** on port 8097

3. **Connect your React application** using one of these methods:

#### Method 1: Browser Extension
1. Install React Context DevTool browser extension
2. Open extension settings
3. Select "Standalone Connection"
4. Set port to 8097
5. Click "Connect"

#### Method 2: Direct Integration
Add this to your React app:
```javascript
// Add to your main app file
if (process.env.NODE_ENV === 'development') {
  import('react-context-devtool').then(({ connectToDevTools }) => {
    connectToDevTools('ws://localhost:8097');
  });
}
```

### Setting Up Context for Debugging

```javascript
// Set displayName for better debugging
const MyContext = React.createContext();
MyContext.displayName = 'MyContext';

// Or use displayName prop
<MyContext.Provider 
  value={value} 
  displayName="My Context Provider"
>
  <App />
</MyContext.Provider>
```

### Setting Up useReducer for Debugging

```javascript
// Named reducer functions work best
function myReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(myReducer, { count: 0 });
```

## 🏗️ Architecture

### Main Process (`main.js`)
- Creates the main window
- Manages WebSocket server
- Handles IPC communication
- Manages application lifecycle

### Renderer Process (`src/`)
- React-based UI
- Context and useReducer visualization
- JSON editing and action dispatching
- Real-time data updates

### WebSocket Communication
```javascript
// Message types
{
  type: 'react-context-devtool-handshake',
  source: 'react-context-devtool-extension'
}

{
  type: 'react-context-devtool-data',
  payload: {
    context: {...},
    useReducer: {...},
    contextKeys: [...],
    useReducerKeys: [...]
  }
}

{
  type: 'react-action-dispatch',
  payload: {
    type: 'useReducer',
    debugId: 'useReducer - 1',
    data: { type: 'INCREMENT' }
  }
}
```

## 📁 Project Structure

```
electron/
├── main.js                 # Main Electron process
├── preload.js             # Preload script for security
├── package.json           # Electron app dependencies
├── webpack.renderer.config.js # Renderer build config
├── assets/                # App icons and resources
├── src/                   # Renderer process source
│   ├── index.js          # Entry point
│   ├── ElectronApp.js    # Main React component
│   ├── components/       # React components
│   └── styles/           # SCSS styles
└── build/                # Built renderer files
```

## 🔧 Configuration

### WebSocket Server
- **Default Port**: 8097
- **Configurable**: Change in the app settings
- **Auto-start**: Starts when app launches

### Security
- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer
- **Preload Script**: Secure IPC communication

### Build Configuration
- **Target**: Electron 27+
- **Renderer**: Modern browsers (Chromium)
- **Packaging**: electron-builder

## 🐛 Troubleshooting

### Connection Issues

**Problem**: Can't connect to React app
**Solutions**:
- Check if port 8097 is available
- Verify firewall settings
- Ensure React app is running
- Check browser console for WebSocket errors

**Problem**: No data received
**Solutions**:
- Verify React Context is being used
- Check if displayName is set on Context
- Ensure useReducer is in development mode
- Refresh the React application

### Build Issues

**Problem**: Build fails
**Solutions**:
- Clear node_modules and reinstall
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check for TypeScript/Babel errors

### Performance Issues

**Problem**: App is slow
**Solutions**:
- Limit the amount of data being debugged
- Use React.memo for expensive components
- Check for memory leaks in WebSocket connections

## 🚀 Development

### Running in Development

```bash
# Start with hot reload
npm run dev

# Build renderer only
npm run build:dev

# Debug main process
npm start -- --inspect=9229
```

### Adding Features

1. **Renderer Features**: Add to `src/` directory
2. **Main Process Features**: Modify `main.js`
3. **IPC Communication**: Update `preload.js`

### Testing

```bash
# Test WebSocket connection
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8097');
ws.on('open', () => console.log('Connected!'));
"
```

## 📦 Distribution

### Building Packages

```bash
# Build for current platform
npm run dist

# Build for specific platforms
npm run dist -- --win
npm run dist -- --mac
npm run dist -- --linux
```

### Package Outputs
- **Windows**: `.exe` installer and portable
- **macOS**: `.dmg` and `.app`
- **Linux**: `.AppImage` and `.deb`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see the main project LICENSE file.

## 🔗 Related

- [React Context DevTool Extension](../README.md)
- [Standalone WebSocket Server](../example/standalone/)
- [Browser Extension Source](../extension/)

## 💡 Tips

- **Use named functions** for reducers for better debugging
- **Set displayName** on Context for clearer identification  
- **Keep state serializable** for best debugging experience
- **Use development mode** for useReducer debugging
- **Monitor WebSocket connection** in the app status bar

---

For more information, visit the [main project repository](https://github.com/deeppatel234/react-context-devtool).