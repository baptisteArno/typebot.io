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

export const defaultLightTextColor = "#303235";
export const defaultDarkTextColor = "#FFFFFF";

/*---- General ----*/

// Font
export const defaultFontType = "Google";
export const defaultFontFamily = "Open Sans";

// Background
export const defaultBackgroundType = BackgroundType.COLOR;
export const defaultBackgroundColor = "#ffffff";

// Progress bar
export const defaultProgressBarIsEnabled = false;
export const defaultProgressBarColor = "#0042DA";
export const defaultProgressBarBackgroundColor = "#e0edff";
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
export const defaultHostBubblesBackgroundColor = "#F7F8FF";
export const defaultHostBubblesColor = defaultLightTextColor;

// Guest bubbles
export const defaultGuestBubblesBackgroundColor = "#FF8E21";
export const defaultGuestBubblesColor = defaultDarkTextColor;

// Buttons
export const defaultButtonsBackgroundColor = "#0042DA";
export const defaultButtonsColor = defaultDarkTextColor;
export const defaultButtonsBorderThickness = 1;

// Inputs
export const defaultInputsBackgroundColor = "#FFFFFF";
export const defaultInputsColor = defaultLightTextColor;
export const defaultInputsPlaceholderColor = "#9095A0";
export const defaultInputsShadow = "md";

// Host avatar
export const defaultHostAvatarIsEnabled = true;

// Guest avatar
export const defaultGuestAvatarIsEnabled = false;
