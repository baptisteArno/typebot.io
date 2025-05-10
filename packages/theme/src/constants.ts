import { colors } from "@typebot.io/ui/colors";

export enum BackgroundType {
  COLOR = "Color",
  IMAGE = "Image",
  NONE = "None",
}

export const fontTypes = ["Google", "Custom"] as const;

export const progressBarPlacements = ["Top", "Bottom"] as const;
export const progressBarPositions = ["fixed", "absolute"] as const;

export const shadows = ["none", "sm", "md", "lg", "xl", "2xl"] as const;
export const borderRoundness = ["none", "medium", "large", "custom"] as const;

/*---- General ----*/

// Font
export const defaultFontType = "Google";
export const defaultFontFamily = "Open Sans";

// Background
export const defaultBackgroundType = BackgroundType.COLOR;
export const defaultBackgroundColor = {
  "6": "#FFFFFF",
  "6.1": colors.gray.light["2"],
} as const;

// Progress bar
export const defaultProgressBarIsEnabled = false;
export const defaultProgressBarColor = {
  "6": "#e0edff",
  "6.1": colors.orange.light["9"],
} as const;
export const defaultProgressBarBackgroundColor = {
  "6": colors.gray.light["3"],
  "6.1": colors.gray.light["9"],
} as const;
export const defaultProgressBarThickness = 4;
export const defaultProgressBarPosition = "absolute";
export const defaultProgressBarPlacement = "Top";

export const defaultRoundness = "medium";
export const defaultOpacity = 1;
export const defaultBlur = 0;

/*---- Chat ----*/

// Container
export const defaultContainerMaxWidth = "800px";
export const defaultContainerMaxHeight = "100%";
export const defaultContainerBackgroundColor = "transparent";
export const defaultContainerColor = "#27272A";

// Host bubbles
export const defaultHostBubblesBackgroundColor = {
  "6": "#F7F8FF",
  "6.1": colors.gray.light["1"],
} as const;
export const defaultHostBubblesColor = colors.gray.light["12"];
export const defaultHostBubbleBorderThickness = {
  "6": 0,
  "6.1": 1,
} as const;
export const defaultHostBubbleBorderColor = colors.gray.light["6"];

// Guest bubbles
export const defaultGuestBubblesBackgroundColor = {
  "6": "#FF8E21",
  "6.1": colors.orange.light["9"],
} as const;
export const defaultGuestBubblesColor = colors.gray.light["1"];
export const defaultGuestBubbleBorderThickness = {
  "6": 0,
  "6.1": 1,
} as const;
export const defaultGuestBubbleBorderColor = colors.orange.light["6"];

// Buttons
export const defaultButtonsBackgroundColor = {
  "6": "#0042DA",
  "6.1": colors.orange.light["9"],
} as const;
export const defaultButtonsColor = colors.gray.light["1"];
export const defaultButtonsBorderThickness = {
  "6": 0,
  "6.1": 1,
} as const;
export const defaultButtonsBorderColor = colors.orange.light["8"];
export const defaultButtonsLayout = "wrap";

// Inputs
export const defaultInputsBackgroundColor = "#FFFFFF";
export const defaultInputsColor = colors.gray.light["12"];
export const defaultInputsPlaceholderColor = "#9095A0";
export const defaultInputsBorderThickness = {
  "6": 0,
  "6.1": 1,
} as const;
export const defaultInputsBorderColor = {
  "6": undefined,
  "6.1": colors.gray.light["7"],
} as const;
export const defaultInputsShadow = {
  "6": "md",
  "6.1": undefined,
} as const;

// Host avatar
export const defaultHostAvatarIsEnabled = true;

// Guest avatar
export const defaultGuestAvatarIsEnabled = false;

// Buttons input
export const defaultButtonsInputLayout = "wrap";

export const botCssVariableNames = {
  general: {
    bgImage: "--typebot-container-bg-image",
    bgColor: "--typebot-container-bg-color",
    fontFamily: "--typebot-container-font-family",
    progressBar: {
      position: "--typebot-progress-bar-position",
      color: "--typebot-progress-bar-color",
      colorRgb: "--typebot-progress-bar-bg-rgb",
      height: "--typebot-progress-bar-height",
      top: "--typebot-progress-bar-top",
      bottom: "--typebot-progress-bar-bottom",
    },
  },
  chat: {
    container: {
      maxWidth: "--typebot-chat-container-max-width",
      maxHeight: "--typebot-chat-container-max-height",
      bgColor: "--typebot-chat-container-bg-rgb",
      color: "--typebot-chat-container-color",
      borderRadius: "--typebot-chat-container-border-radius",
      borderWidth: "--typebot-chat-container-border-width",
      borderColor: "--typebot-chat-container-border-rgb",
      borderOpacity: "--typebot-chat-container-border-opacity",
      opacity: "--typebot-chat-container-opacity",
      blur: "--typebot-chat-container-blur",
      boxShadow: "--typebot-chat-container-box-shadow",
    },
    hostBubbles: {
      bgColor: "--typebot-host-bubble-bg-rgb",
      color: "--typebot-host-bubble-color",
      borderRadius: "--typebot-host-bubble-border-radius",
      borderWidth: "--typebot-host-bubble-border-width",
      borderColor: "--typebot-host-bubble-border-rgb",
      borderOpacity: "--typebot-host-bubble-border-opacity",
      opacity: "--typebot-host-bubble-opacity",
      blur: "--typebot-host-bubble-blur",
      boxShadow: "--typebot-host-bubble-box-shadow",
    },
    guestBubbles: {
      bgColor: "--typebot-guest-bubble-bg-rgb",
      color: "--typebot-guest-bubble-color",
      borderRadius: "--typebot-guest-bubble-border-radius",
      borderWidth: "--typebot-guest-bubble-border-width",
      borderColor: "--typebot-guest-bubble-border-rgb",
      borderOpacity: "--typebot-guest-bubble-border-opacity",
      opacity: "--typebot-guest-bubble-opacity",
      blur: "--typebot-guest-bubble-blur",
      boxShadow: "--typebot-guest-bubble-box-shadow",
    },
    inputs: {
      bgColor: "--typebot-input-bg-rgb",
      color: "--typebot-input-color",
      placeholderColor: "--typebot-input-placeholder-color",
      borderRadius: "--typebot-input-border-radius",
      borderWidth: "--typebot-input-border-width",
      borderColor: "--typebot-input-border-rgb",
      borderOpacity: "--typebot-input-border-opacity",
      opacity: "--typebot-input-opacity",
      blur: "--typebot-input-blur",
      boxShadow: "--typebot-input-box-shadow",
    },
    buttons: {
      bgRgb: "--typebot-button-bg-rgb",
      color: "--typebot-button-color",
      borderRadius: "--typebot-button-border-radius",
      borderWidth: "--typebot-button-border-width",
      borderColor: "--typebot-button-border-rgb",
      borderOpacity: "--typebot-button-border-opacity",
      opacity: "--typebot-button-opacity",
      blur: "--typebot-button-blur",
      boxShadow: "--typebot-button-box-shadow",
      flexDirection: "--typebot-buttons-input-flex-direction",
    },
    checkbox: {
      bgRgb: "--typebot-checkbox-bg-rgb",
      alphaRatio: "--selectable-alpha-ratio",
    },
  },
} as const;

export const defaultPreviewMessageBackgroundColor = "#F7F8FF";
export const defaultPreviewMessageTextColor = "#303235";
export const defaultPreviewMessageCloseButtonBackgroundColor = "#F7F8FF";
export const defaultPreviewMessageCloseButtonIconColor = "#303235";
