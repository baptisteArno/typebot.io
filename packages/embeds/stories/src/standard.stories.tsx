import { Standard } from "@typebot.io/react";

export const Default = () => {
  return (
    <div style={{ height: "500px" }}>
      <Standard templateSlug="lead-gen" apiHost="http://localhost:3001" />
    </div>
  );
};

export const StartWhenIntoView = () => {
  return (
    <>
      <div style={{ height: "300vh" }} />
      <Standard
        templateSlug="lead-gen"
        apiHost="http://localhost:3001"
        style={{ height: "300px" }}
      />
    </>
  );
};
