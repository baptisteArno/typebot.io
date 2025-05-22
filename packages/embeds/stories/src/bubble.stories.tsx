import {
  Bubble,
  close,
  hidePreviewMessage,
  open,
  reload,
  sendCommand,
  setInputValue,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
} from "@typebot.io/react";
import { useState } from "react";

export const Default = () => {
  const [name, setName] = useState("John");

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button onClick={toggle}>Toggle chat window</button>
        <button onClick={open}>Open chat window</button>
        <button onClick={close}>Close chat window</button>
        <button onClick={reload}>Reload chat</button>
        <button onClick={() => showPreviewMessage()}>
          Show Preview Message
        </button>
        <button onClick={() => setInputValue("YOOOO!")}>Set input value</button>
        <button onClick={hidePreviewMessage}>Close Preview Message</button>
        <button onClick={() => sendCommand("wizz")}>Send command</button>
        <div>
          <p>Predefined name:</p>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={() => setPrefilledVariables({ Name: name })}>
            Set predefined name
          </button>
        </div>
        <Bubble
          typebot="lead-generation-hdb7t54"
          apiHost="http://localhost:3001"
          wsHost="localhost:1999"
          prefilledVariables={{
            Name: ["John"],
          }}
          previewMessage={{
            avatarUrl: "https://avatars.githubusercontent.com/u/16015833?v=4",
            message: "Hello, I am a preview message",
            autoShowDelay: 3000,
          }}
          theme={{
            button: {
              customIconSrc:
                "https://avatars.githubusercontent.com/u/16015833?v=4",
            },
          }}
          // isPreview
        />
      </div>
    </div>
  );
};
