export const RootPage = ({ dashboardUrl }: { dashboardUrl: string }) => (
  <div
    style={{
      height: "100dvh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    }}
  >
    <div>
      <h1 style={{ fontWeight: "bold", fontSize: "30px" }}>
        Welcome to Typebot
      </h1>
      <p>
        Typebot is a no-code platform that enables you to effortlessly create
        and integrate advanced chatbots into websites and chat platforms like
        WhatsApp.
      </p>
      <p>
        Go to the <a href={dashboardUrl}>dashboard</a>.
      </p>
    </div>
  </div>
);
