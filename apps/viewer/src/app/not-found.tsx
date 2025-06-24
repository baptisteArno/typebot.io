import { TypebotLogo } from "@/components/TypebotLogo";
import "../assets/styles.css";

export default function NotFound() {
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "0 1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          alignItems: "center",
        }}
      >
        <a href="https://typebot.io" style={{ color: "inherit" }}>
          <TypebotLogo style={{ fontSize: "32px" }} />
        </a>

        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "normal" }}>
          The bot you're looking for doesn't exist
        </h1>
      </div>
    </div>
  );
}
