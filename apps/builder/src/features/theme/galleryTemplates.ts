import { env } from "@typebot.io/env";
import { BackgroundType } from "@typebot.io/theme/constants";
import type { ThemeTemplate } from "@typebot.io/theme/schemas";

const getOrigin = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return env.NEXTAUTH_URL;
};

export const galleryTemplates: Pick<ThemeTemplate, "id" | "name" | "theme">[] =
  [
    {
      id: "typebot-light",
      name: "Typebot Light",
      theme: {},
    },
    {
      id: "typebot-dark",
      name: "Typebot Dark",
      theme: {
        chat: {
          inputs: {
            color: "#ffffff",
            backgroundColor: "#1e293b",
            placeholderColor: "#9095A0",
          },
          hostBubbles: { color: "#ffffff", backgroundColor: "#1e293b" },
        },
        general: {
          background: { type: BackgroundType.COLOR, content: "#171923" },
        },
      },
    },
    {
      id: "minimalist-black",
      name: "Minimalist Black",
      theme: {
        chat: {
          buttons: { backgroundColor: "#303235" },
          hostAvatar: { isEnabled: false },
          guestBubbles: { color: "#303235", backgroundColor: "#F7F8FF" },
        },
        general: {
          font: {
            type: "Google",
            family: "Inter",
          },
        },
      },
    },
    {
      id: "minimalist-teal",
      name: "Minimalist Teal",
      theme: {
        chat: {
          buttons: { backgroundColor: "#0d9488" },
          hostAvatar: { isEnabled: false },
          guestBubbles: { color: "#303235", backgroundColor: "#F7F8FF" },
        },
        general: {
          font: {
            type: "Google",
            family: "Inter",
          },
        },
      },
    },

    {
      id: "bright-rain",
      name: "Bright Rain",
      theme: {
        chat: {
          buttons: { backgroundColor: "#D27A7D" },
          guestBubbles: { color: "#303235", backgroundColor: "#FDDDBF" },
        },
        general: {
          font: {
            type: "Google",
            family: "Montserrat",
          },
          background: {
            type: BackgroundType.IMAGE,
            content: getOrigin() + "/images/backgrounds/brightRain.jpeg",
          },
        },
      },
    },
    {
      id: "ray-of-lights",
      name: "Ray of Lights",
      theme: {
        chat: {
          buttons: { backgroundColor: "#1A2249" },
          guestBubbles: { backgroundColor: "#1A2249" },
        },
        general: {
          font: {
            type: "Google",
            family: "Raleway",
          },
          background: {
            type: BackgroundType.IMAGE,
            content: getOrigin() + "/images/backgrounds/rayOfLights.jpeg",
          },
        },
      },
    },
    {
      id: "aqua-glass",
      name: "Aqua Glass",
      theme: {
        general: {
          background: {
            type: BackgroundType.IMAGE,
            content:
              "https://images.unsplash.com/photo-1552083974-186346191183?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MjU2MDR8MHwxfHNlYXJjaHw4fHxhYnN0cmFjdHxlbnwwfDB8fHwxNzEzMjg2NDY1fDA&ixlib=rb-4.0.3&q=80&w=1080",
          },
        },
        chat: {
          container: {
            maxWidth: "750px",
            maxHeight: "80%",
            backgroundColor: "#ffffff",
            blur: 5,
            opacity: 0.6,
            border: {
              thickness: 2,
              color: "#FFFFFF",
              roundeness: "large",
              opacity: 0.5,
            },
          },
        },
      },
    },
    {
      id: "pi",
      name: "Pi",
      theme: {
        general: {
          font: {
            type: "Custom",
            family: "StratfordEF-Regular",
            css: '@font-face {\n    font-family: "StratfordEF-Regular";\n    src: url("https://db.onlinewebfonts.com/t/c85eb6186357a8930b49b2ecfa59757a.eot");\n    src: url("https://db.onlinewebfonts.com/t/c85eb6186357a8930b49b2ecfa59757a.eot?#iefix")format("embedded-opentype"),\n    url("https://db.onlinewebfonts.com/t/c85eb6186357a8930b49b2ecfa59757a.woff2")format("woff2"),\n    url("https://db.onlinewebfonts.com/t/c85eb6186357a8930b49b2ecfa59757a.woff")format("woff"),\n    url("https://db.onlinewebfonts.com/t/c85eb6186357a8930b49b2ecfa59757a.ttf")format("truetype"),\n    url("https://db.onlinewebfonts.com/t/c85eb6186357a8930b49b2ecfa59757a.svg#StratfordEF-Regular")format("svg");\n}',
          },
          background: { content: "#FAF3EA" },
        },
        chat: {
          hostAvatar: { isEnabled: false },
          hostBubbles: {
            backgroundColor: "transparent",
            color: "#0E3C26",
          },
          guestBubbles: {
            backgroundColor: "#F5EADB",
            color: "#0E3C26",
          },
          buttons: {
            backgroundColor: "#058247",
            color: "#FCFAF7",
            border: { roundeness: "large" },
          },
          inputs: {
            backgroundColor: "#ffffff",
            color: "#0E3C26",
            shadow: "none",
            border: {
              roundeness: "custom",
              customRoundeness: 30,
              opacity: 1,
            },
            placeholderColor: "#C1B49F",
          },
        },
        customCss:
          ".typebot-guest-bubble,\n.typebot-host-bubble,\n.typebot-input-container {\n  font-size: 1.375rem;\n}\n\n.typebot-input-container:has(input) {\n  border-radius: 5rem;\n  position: absolute;\n  bottom: 3rem;\n  width: calc(100% - 40px);\n  justify-content: flex-start;\n  background-color: #fff;\n  border: 1px solid #E2D5BF;\n}\n\n.typebot-input-form {\n  max-width: unset\n}\n\n.typebot-input-form > button {\n  border-radius: 5rem;\n  transform: scale(.7);\n}\n\n.bubble-typing,\n.slate-html-container,\n.typebot-host-bubble > figure{\n  padding: 0;\n  margin: 0\n}\n\n.slate-html-container {\n  margin-bottom: .5rem\n}",
      },
    },
  ];
