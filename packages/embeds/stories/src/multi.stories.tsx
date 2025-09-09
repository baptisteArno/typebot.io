import { Bubble, close, open, Popup } from "@typebot.io/react";

export const Default = () => {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button onClick={() => open({ id: "bubble" })}>Open bubble</button>
        <button onClick={() => close({ id: "bubble" })}>Close bubble</button>
        <button onClick={() => open({ id: "popup" })}>Open popup</button>
        <button onClick={() => close({ id: "popup" })}>Close popup</button>
      </div>

      <Popup
        id="popup"
        typebot={"my-typebot-2b532x1"}
        apiHost="http://localhost:3001"
        prefilledVariables={{
          Name: ["John"],
        }}
      />
      <Bubble
        id="bubble"
        typebot={"my-typebot-2b532x1"}
        apiHost="http://localhost:3001"
      />
    </div>
  );
};
