import { open, Popup, toggle } from "@typebot.io/react";

export const Default = () => {
  return (
    <>
      <button type="button" onClick={() => open()}>
        Open modal
      </button>
      <button type="button" onClick={() => toggle()}>
        Toggle modal
      </button>
      <Popup
        templateSlug="lead-gen"
        apiHost="http://localhost:3001"
        autoShowDelay={3000}
        theme={{
          width: "800px",
        }}
      />
    </>
  );
};
