import { onCleanup, onMount } from "solid-js";
import { TypebotLogo } from "./icons/TypebotLogo";

type Props = {
  botContainer: HTMLDivElement | undefined;
};

export const LiteBadge = (props: Props) => {
  let liteBadge: HTMLAnchorElement | undefined;
  let elementObserver: MutationObserver | undefined;
  let attributeObserver: MutationObserver | undefined;

  const defaultStyles = {
    display: "flex",
    opacity: "1",
    visibility: "visible",
    "pointer-events": "auto",
    transform: "none",
    "clip-path": "none",
    width: "auto",
    height: "auto",
    position: "absolute",
    padding: "4px 8px",
    "background-color": "white",
    "z-index": "50",
    "border-radius": "4px",
    color: "rgb(17 24 39)",
    gap: "8px",
    "font-size": "14px",
    "line-height": "20px",
    "font-weight": "600",
    "border-width": "1px",
    "border-color": "#cecece",
    top: "auto",
    right: "auto",
    left: "auto",
    bottom: "20px",
    transition: "background-color 0.2s ease-in-out",
    "text-decoration": "none",
  } as const;

  onMount(() => {
    if (!document || !props.botContainer || !liteBadge) return;

    // Watch for element removal
    elementObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((removedNode) => {
          if (
            "id" in removedNode &&
            liteBadge &&
            removedNode.id === "lite-badge"
          ) {
            console.log("Sorry, you can't remove the brand 😅");
            props.botContainer?.append(liteBadge);
          }
        });
      });
    });
    elementObserver.observe(props.botContainer, {
      subtree: false,
      childList: true,
    });

    attributeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && liteBadge) {
          if (mutation.attributeName === "style") {
            Object.assign(liteBadge.style, defaultStyles);
          }
          if (mutation.attributeName === "class") {
            liteBadge.className = "lite-badge";
          }
          if (mutation.attributeName === "href") {
            liteBadge.href = "https://www.typebot.io/?utm_source=litebadge";
          }
          if (mutation.attributeName === "id") {
            liteBadge.id = "lite-badge";
          }
        }
      });
    });
    attributeObserver.observe(liteBadge, {
      attributes: true,
      attributeFilter: ["style", "class", "href", "id"],
    });
  });

  onCleanup(() => {
    if (elementObserver) elementObserver.disconnect();
    if (attributeObserver) attributeObserver.disconnect();
  });

  return (
    <a
      ref={liteBadge}
      href={"https://www.typebot.io/?utm_source=litebadge"}
      target="_blank"
      rel="noopener noreferrer"
      class="lite-badge"
      id="lite-badge"
      style={defaultStyles}
    >
      <TypebotLogo />
      <span>Made with Typebot</span>
    </a>
  );
};
