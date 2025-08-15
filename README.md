<p align="center">
  <img src="https://github.com/deeppatel234/react-context-devtool/blob/master/store-assets/cover.png?raw=true" width="80%"/>
</p>

<h2 align="center">Devtool for React Context and useReducer Hook</h2>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![NPM Download](https://img.shields.io/npm/dt/react-context-devtool.svg)](https://www.npmjs.com/package/react-context-devtool) [![NPM](https://img.shields.io/npm/v/react-context-devtool.svg)](https://www.npmjs.com/package/react-context-devtool)

<p align="center">
  <img src="https://github.com/deeppatel234/react-context-devtool/blob/master/store-assets/screenshots/context-tree-view.png?raw=true" width="50%"/>
</p>
<p align="center">
  <img src="https://github.com/deeppatel234/react-context-devtool/blob/master/store-assets/screenshots/context-raw-view.png?raw=true" width="30%"/>
  <img src="https://github.com/deeppatel234/react-context-devtool/blob/master/store-assets/screenshots/reducer-action-view.png?raw=true" width="30%"/>
  <img src="https://github.com/deeppatel234/react-context-devtool/blob/master/store-assets/screenshots/reducer-diff-view.png?raw=true" width="30%"/>
</p>

## Installation

- Download extension from
    - [Chrome Web Store](https://chrome.google.com/webstore/detail/oddhnidmicpefilikhgeagedibnefkcf)
    - [Microsoft Edge Addons Store](https://microsoftedge.microsoft.com/addons/detail/react-context-devtool/bnclaomncapgohhafjepfklgbjdjlfcd)
    - [Firefox Addons Store](https://addons.mozilla.org/en-US/firefox/addon/react-context-devtool1) (latest)
    - [Firefox Addons Store](https://addons.mozilla.org/en-US/firefox/addon/react-context-devtool) (upto V3.3)


## Set Display names

#### Display name for Context API

- set `dispayName` props in `Provider`

```js
<MyContext.Provider value={{ a: 'hello', b: 'world' }} displayName="Context Display Name">
  <YourComponent />
</MyContext.Provider>
```

or

- assign display name in Context

```js
  MyContext.displayName = "Context Display Name";
```

#### Display name for useReducer

- reducer function name is use as displayName in debug

## Settings

- <b>Chrome</b> : right click on react-context-devtool icon and click on "Options"
- <b>Firefox</b> : right click on react-context-devtool icon and click on "Manage Extenstion" and select "Preferences" tab

| Name  | Type  | Default | Description  |
| ------ | ------ | ------ | ------ |
| Connection Mode | Browser Extension | `true` | Use browser extension to debug React Context (default) |
| | Standalone Connection | `false` | Connect to standalone React DevTools via WebSocket |
| Start Debugging  | On Extensions Load  | `true`  | Start data capturing after extenstion is opened in dev panel (recommended) |
|   | On Page Load  | `false`  | Start data capturing after page load  |
| Enable Debug | useReducer  | `true`  |  enable/disable useReducer debug. Available only in development mode  |
| | Context  | `true`  | enable/disable context debug  |

## Standalone Connection

The extension now supports connecting to standalone React DevTools via WebSocket, similar to how the official React DevTools work. This is useful for:

- Debugging React Native applications
- Remote debugging scenarios  
- Development environments where browser extensions are not available

### Setup Standalone Connection

1. Start a standalone React DevTools server:
```bash
npx react-devtools --port=8097
```

2. Or use the example server provided:
```bash
cd example/standalone
npm install
npm start
```

3. In the extension settings, select "Standalone Connection"
4. Set the port (default: 8097)
5. Click "Connect"

### WebSocket Protocol

The extension communicates using these message types:
- `react-context-devtool-handshake`: Initial connection
- `react-context-devtool-data`: Context/useReducer data
- `react-context-devtool-dispatch`: Action dispatching

<p align="center">
  <img src="https://github.com/deeppatel234/react-context-devtool/blob/master/store-assets/screenshots/settings.jpeg?raw=true" width="50%"/>
</p>

## Troubleshooting

### "React is not found in this page" when using NextJS
This extension requires [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) installed on your browser to work. Try to install the extension and restart the browser to fix it.

## License

MIT

---

Cross-browser testing provided by <a href="http://browserstack.com">Browserstack</a>.
