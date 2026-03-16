import { Bubble, close, open, Popup } from "@typebot.io/react";
import { useId } from "react";

export const Default = () => {
  const popupId = useId();
  const bubbleId = useId();

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button type="button" onClick={() => open({ id: bubbleId })}>
          Open bubble
        </button>
        <button type="button" onClick={() => close({ id: bubbleId })}>
          Close bubble
        </button>
        <button type="button" onClick={() => open({ id: popupId })}>
          Open popup
        </button>
        <button type="button" onClick={() => close({ id: popupId })}>
          Close popup
        </button>
      </div>

      <Popup
        id={popupId}
        typebot={"my-typebot-2b532x1"}
        apiHost="http://localhost:3001"
        prefilledVariables={{
          Name: ["John"],
        }}
      />
      <Bubble
        id={bubbleId}
        typebot={"my-typebot-2b532x1"}
        apiHost="http://localhost:3001"
      />
    </div>
  );
};
