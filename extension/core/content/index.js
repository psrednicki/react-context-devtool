import {
  sendMessage,
  onWindowMessage,
  sendToWindow,
  onMessage,
} from "@ext-browser/messaging/content";

// Import standalone connector
import "./standaloneConnector";

window.addEventListener(
  "message",
  async (event) => {
    if (event.source != window) return;

    if (
      event.data.source === "react-devtools-detector" ||
      event.data.source === "react-devtools-hook"
    ) {
      try {
        await sendMessage("background", "REACT_JS_FOUND", event.data.payload);
      } catch (error) {}
    }
  },
  false,
);

onMessage("START_DEVTOOL", (data) => {
  sendToWindow("START_DEBUGGING", data);
});

onMessage("STOP_DEVTOOL", (data) => {
  sendToWindow("STOP_DEBUGGING", data);
});

onMessage("DISPATCH_ACTION", (data) => {
  sendToWindow("DISPATCH_USE_REDUCER_ACTION", data);
});

onWindowMessage("CONTEXT_DATA_UPDATED", async (data) => {
  try {
    await sendMessage("background", "CONTEXT_DATA_UPDATED", data);
  } catch (error) {}
});

// Handle standalone connection messages
window.addEventListener("message", async (event) => {
  if (event.source !== window) return;
  
  if (event.data.source === "react-context-devtool-standalone") {
    try {
      await sendMessage("background", event.data.type, event.data.data);
    } catch (error) {
      console.error("Error forwarding standalone message:", error);
    }
  }
}, false);

// Handle messages from background for standalone connection
onMessage("STANDALONE_CONNECT", (data) => {
  window.postMessage({
    source: "react-context-devtool-background",
    type: "CONNECT_STANDALONE",
    port: data.port
  }, "*");
});

onMessage("STANDALONE_DISCONNECT", () => {
  window.postMessage({
    source: "react-context-devtool-background",
    type: "DISCONNECT_STANDALONE"
  }, "*");
});

onMessage("STANDALONE_SEND_DATA", (data) => {
  window.postMessage({
    source: "react-context-devtool-background",
    type: "SEND_DATA",
    data: data
  }, "*");
});

// function manualScriptToInject() {
//   window.__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK.debug = (data) => {
//     const helpers = window.__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK.helpers;
//     window.postMessage(
//       {
//         type: "__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK_EVENT",
//         subType: "ADD_APP_DATA",
//         data: helpers.parseData({
//           context: {
//             [data.id]: {
//               displayName: data.displayName,
//               value: data.values,
//               valueChanged: true,
//               remove: false,
//             },
//           },
//         }),
//       },
//       "*"
//     );
//   };
// }
