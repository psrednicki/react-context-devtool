import React from 'react';
import { createRoot } from 'react-dom/client';
import ElectronApp from './ElectronApp';
import './styles/app.scss';

// Initialize the React app
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app
root.render(<ElectronApp />);

// Hot module replacement for development
if (module.hot) {
  module.hot.accept('./ElectronApp', () => {
    const NextElectronApp = require('./ElectronApp').default;
    root.render(<NextElectronApp />);
  });
}

// Log startup
console.log('React Context DevTool Electron app started');
console.log('Platform:', window.electronAPI?.platform);
console.log('Versions:', window.electronAPI?.versions);