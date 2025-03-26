import { hexToRgb, isLight } from "@typebot.io/lib/hexToRgb";
import { isDefined, isEmpty } from "@typebot.io/lib/utils";
import type { TypebotV6Version } from "@typebot.io/schemas/versions";
import {
  BackgroundType,
  botCssVariableNames,
  defaultBackgroundColor,
  defaultBackgroundType,
  defaultBlur,
  defaultButtonsBackgroundColor,
  defaultButtonsBorderColor,
  defaultButtonsBorderThickness,
  defaultButtonsColor,
  defaultButtonsInputLayout,
  defaultContainerBackgroundColor,
  defaultContainerMaxHeight,
  defaultContainerMaxWidth,
  defaultFontFamily,
  defaultGuestBubbleBorderColor,
  defaultGuestBubbleBorderThickness,
  defaultGuestBubblesBackgroundColor,
  defaultGuestBubblesColor,
  defaultHostBubbleBorderColor,
  defaultHostBubbleBorderThickness,
  defaultHostBubblesBackgroundColor,
  defaultHostBubblesColor,
  defaultInputsBackgroundColor,
  defaultInputsBorderColor,
  defaultInputsBorderThickness,
  defaultInputsColor,
  defaultInputsPlaceholderColor,
  defaultInputsShadow,
  defaultOpacity,
  defaultProgressBarBackgroundColor,
  defaultProgressBarColor,
  defaultProgressBarPlacement,
  defaultProgressBarPosition,
  defaultProgressBarThickness,
  defaultRoundness,
} from "@typebot.io/theme/constants";
import { isChatContainerLight } from "@typebot.io/theme/helpers/isChatContainerLight";
import type {
  Background,
  ChatTheme,
  ContainerBorderTheme,
  ContainerTheme,
  GeneralTheme,
  InputTheme,
  Theme,
} from "@typebot.io/theme/schemas";
import { colors } from "@typebot.io/ui/colors";

type CommonProps = {
  documentStyle: CSSStyleDeclaration;
  isPreview?: boolean;
  typebotVersion: TypebotV6Version;
};

export const setCssVariablesValue = ({
  theme,
  container,
  isPreview,
  typebotVersion,
}: {
  theme: Theme | undefined;
  container: HTMLDivElement;
} & Omit<CommonProps, "documentStyle">) => {
  if (!theme) return;
  const documentStyle = container?.style;
  if (!documentStyle) return;
  setGeneralTheme({
    generalTheme: theme.general,
    documentStyle,
    isPreview,
    typebotVersion,
  });
  setChatTheme({
    chatTheme: theme.chat,
    generalBackground: theme.general?.background,
    documentStyle,
    typebotVersion,
  });
};

const setGeneralTheme = ({
  generalTheme,
  documentStyle,
  isPreview,
  typebotVersion,
}: {
  generalTheme: GeneralTheme | undefined;
} & CommonProps) => {
  setGeneralBackground({
    background: generalTheme?.background,
    documentStyle,
    typebotVersion,
  });
  documentStyle.setProperty(
    botCssVariableNames.general.fontFamily,
    (typeof generalTheme?.font === "string"
      ? generalTheme.font
      : generalTheme?.font?.family) ?? defaultFontFamily,
  );
  setProgressBar({
    progressBar: generalTheme?.progressBar,
    documentStyle,
    isPreview,
    typebotVersion,
  });
};

const setProgressBar = ({
  progressBar,
  documentStyle,
  isPreview,
  typebotVersion,
}: {
  progressBar: GeneralTheme["progressBar"];
} & CommonProps) => {
  const position = progressBar?.position ?? defaultProgressBarPosition;

  documentStyle.setProperty(
    botCssVariableNames.general.progressBar.position,
    position === "fixed" ? (isPreview ? "absolute" : "fixed") : position,
  );
  documentStyle.setProperty(
    botCssVariableNames.general.progressBar.color,
    progressBar?.color ?? defaultProgressBarColor[typebotVersion],
  );
  documentStyle.setProperty(
    botCssVariableNames.general.progressBar.colorRgb,
    hexToRgb(
      progressBar?.backgroundColor ??
        defaultProgressBarBackgroundColor[typebotVersion],
    ).join(", "),
  );
  documentStyle.setProperty(
    botCssVariableNames.general.progressBar.height,
    `${progressBar?.thickness ?? defaultProgressBarThickness}px`,
  );

  const placement = progressBar?.placement ?? defaultProgressBarPlacement;

  documentStyle.setProperty(
    botCssVariableNames.general.progressBar.top,
    placement === "Top" ? "0" : "auto",
  );

  documentStyle.setProperty(
    botCssVariableNames.general.progressBar.bottom,
    placement === "Bottom" ? "0" : "auto",
  );
};

const setChatTheme = ({
  chatTheme,
  generalBackground,
  documentStyle,
  typebotVersion,
}: {
  chatTheme: ChatTheme | undefined;
  generalBackground: GeneralTheme["background"];
} & CommonProps) => {
  setChatContainer({
    container: chatTheme?.container,
    generalBackground,
    documentStyle,
    legacyRoundness: chatTheme?.roundness,
    typebotVersion,
  });
  setHostBubbles({
    hostBubbles: chatTheme?.hostBubbles,
    documentStyle,
    legacyRoundness: chatTheme?.roundness,
    typebotVersion,
  });
  setGuestBubbles({
    guestBubbles: chatTheme?.guestBubbles,
    documentStyle,
    legacyRoundness: chatTheme?.roundness,
    typebotVersion,
  });
  setButtons({
    buttons: chatTheme?.buttons,
    documentStyle,
    legacyRoundness: chatTheme?.roundness,
    typebotVersion,
  });
  setInputs({
    inputs: chatTheme?.inputs,
    documentStyle,
    legacyRoundness: chatTheme?.roundness,
    typebotVersion,
  });
  setCheckbox(chatTheme?.container, generalBackground, documentStyle);
  setButtonsInput({
    buttonsInput: chatTheme?.buttonsInput,
    documentStyle,
    typebotVersion,
  });
};

const setChatContainer = ({
  container,
  generalBackground,
  documentStyle,
  legacyRoundness,
}: {
  container: ChatTheme["container"];
  generalBackground: GeneralTheme["background"];
  legacyRoundness?: ChatTheme["roundness"];
} & CommonProps) => {
  const chatContainerBgColor =
    container?.backgroundColor ?? defaultContainerBackgroundColor;
  const isBgDisabled =
    chatContainerBgColor === "transparent" || isEmpty(chatContainerBgColor);
  documentStyle.setProperty(
    botCssVariableNames.chat.container.bgColor,
    isBgDisabled ? "0, 0, 0" : hexToRgb(chatContainerBgColor).join(", "),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.container.color,
    hexToRgb(
      container?.color ??
        (isChatContainerLight({
          chatContainer: container,
          generalBackground,
        })
          ? colors.gray.light[12]
          : colors.gray.dark[12]),
    ).join(", "),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.container.maxWidth,
    container?.maxWidth ?? defaultContainerMaxWidth,
  );
  documentStyle.setProperty(
    botCssVariableNames.chat.container.maxHeight,
    container?.maxHeight ?? defaultContainerMaxHeight,
  );
  const opacity = isBgDisabled
    ? "1"
    : (container?.opacity ?? defaultOpacity).toString();
  documentStyle.setProperty(
    botCssVariableNames.chat.container.opacity,
    isBgDisabled ? "0" : (container?.opacity ?? defaultOpacity).toString(),
  );
  documentStyle.setProperty(
    botCssVariableNames.chat.container.blur,
    opacity === "1" || isBgDisabled
      ? "0xp"
      : `${container?.blur ?? defaultBlur}px`,
  );
  setShadow(
    container?.shadow,
    documentStyle,
    botCssVariableNames.chat.container.boxShadow,
  );

  setBorderRadius(
    container?.border ?? {
      roundeness: legacyRoundness ?? defaultRoundness,
    },
    documentStyle,
    botCssVariableNames.chat.container.borderRadius,
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.container.borderWidth,
    isDefined(container?.border?.thickness)
      ? `${container?.border?.thickness}px`
      : "0",
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.container.borderOpacity,
    isDefined(container?.border?.opacity)
      ? container.border.opacity.toString()
      : defaultOpacity.toString(),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.container.borderColor,
    hexToRgb(container?.border?.color ?? "").join(", "),
  );
};

const setHostBubbles = ({
  hostBubbles,
  documentStyle,
  legacyRoundness,
  typebotVersion,
}: {
  hostBubbles: ContainerTheme | undefined;
  legacyRoundness?: ChatTheme["roundness"];
} & CommonProps) => {
  documentStyle.setProperty(
    botCssVariableNames.chat.hostBubbles.bgColor,
    hexToRgb(
      hostBubbles?.backgroundColor ??
        defaultHostBubblesBackgroundColor[typebotVersion],
    ).join(", "),
  );
  documentStyle.setProperty(
    botCssVariableNames.chat.hostBubbles.color,
    hostBubbles?.color ?? defaultHostBubblesColor,
  );
  setBorderRadius(
    hostBubbles?.border ?? {
      roundeness: legacyRoundness ?? defaultRoundness,
    },
    documentStyle,
    botCssVariableNames.chat.hostBubbles.borderRadius,
  );

  const borderThickness =
    hostBubbles?.border?.thickness ??
    defaultHostBubbleBorderThickness[typebotVersion];
  if (isDefined(borderThickness)) {
    documentStyle.setProperty(
      botCssVariableNames.chat.hostBubbles.borderWidth,
      borderThickness + "px",
    );
  }

  documentStyle.setProperty(
    botCssVariableNames.chat.hostBubbles.borderColor,
    hexToRgb(hostBubbles?.border?.color ?? defaultHostBubbleBorderColor).join(
      ", ",
    ),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.hostBubbles.opacity,
    hostBubbles?.backgroundColor === "transparent"
      ? "0"
      : isDefined(hostBubbles?.opacity)
        ? hostBubbles.opacity.toString()
        : defaultOpacity.toString(),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.hostBubbles.borderOpacity,
    isDefined(hostBubbles?.border?.opacity)
      ? hostBubbles.border.opacity.toString()
      : defaultOpacity.toString(),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.hostBubbles.blur,
    isDefined(hostBubbles?.blur) ? `${hostBubbles.blur ?? 0}px` : "none",
  );

  setShadow(
    hostBubbles?.shadow,
    documentStyle,
    botCssVariableNames.chat.hostBubbles.boxShadow,
  );
};

const setGuestBubbles = ({
  guestBubbles,
  documentStyle,
  legacyRoundness,
  typebotVersion,
}: {
  guestBubbles: ContainerTheme | undefined;
  legacyRoundness?: ChatTheme["roundness"];
} & CommonProps) => {
  documentStyle.setProperty(
    botCssVariableNames.chat.guestBubbles.bgColor,
    hexToRgb(
      guestBubbles?.backgroundColor ??
        defaultGuestBubblesBackgroundColor[typebotVersion],
    ).join(", "),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.guestBubbles.color,
    guestBubbles?.color ?? defaultGuestBubblesColor,
  );

  setBorderRadius(
    guestBubbles?.border ?? {
      roundeness: legacyRoundness ?? defaultRoundness,
    },
    documentStyle,
    botCssVariableNames.chat.guestBubbles.borderRadius,
  );

  const borderThickness =
    guestBubbles?.border?.thickness ??
    defaultGuestBubbleBorderThickness[typebotVersion];
  if (isDefined(borderThickness)) {
    documentStyle.setProperty(
      botCssVariableNames.chat.guestBubbles.borderWidth,
      borderThickness + "px",
    );
  }

  documentStyle.setProperty(
    botCssVariableNames.chat.guestBubbles.borderColor,
    hexToRgb(guestBubbles?.border?.color ?? defaultGuestBubbleBorderColor).join(
      ", ",
    ),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.guestBubbles.borderOpacity,
    isDefined(guestBubbles?.border?.opacity)
      ? guestBubbles.border.opacity.toString()
      : defaultOpacity.toString(),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.guestBubbles.opacity,
    guestBubbles?.backgroundColor === "transparent"
      ? "0"
      : isDefined(guestBubbles?.opacity)
        ? guestBubbles.opacity.toString()
        : defaultOpacity.toString(),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.guestBubbles.blur,
    isDefined(guestBubbles?.blur) ? `${guestBubbles.blur ?? 0}px` : "none",
  );

  setShadow(
    guestBubbles?.shadow,
    documentStyle,
    botCssVariableNames.chat.guestBubbles.boxShadow,
  );
};

const setButtons = ({
  buttons,
  documentStyle,
  legacyRoundness,
  typebotVersion,
}: {
  buttons: ContainerTheme | undefined;
  legacyRoundness?: ChatTheme["roundness"];
} & CommonProps) => {
  const bgColor =
    buttons?.backgroundColor ?? defaultButtonsBackgroundColor[typebotVersion];

  documentStyle.setProperty(
    botCssVariableNames.chat.buttons.bgRgb,
    hexToRgb(bgColor).join(", "),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.buttons.bgRgb,
    hexToRgb(bgColor).join(", "),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.buttons.color,
    buttons?.color ?? defaultButtonsColor,
  );

  setBorderRadius(
    buttons?.border ?? {
      roundeness: legacyRoundness ?? defaultRoundness,
    },
    documentStyle,
    botCssVariableNames.chat.buttons.borderRadius,
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.buttons.borderWidth,
    isDefined(buttons?.border?.thickness)
      ? `${buttons?.border?.thickness}px`
      : `${defaultButtonsBorderThickness[typebotVersion]}px`,
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.buttons.borderColor,
    hexToRgb(
      buttons?.border?.color ??
        buttons?.backgroundColor ??
        defaultButtonsBorderColor,
    ).join(", "),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.buttons.borderOpacity,
    isDefined(buttons?.border?.opacity)
      ? buttons.border.opacity.toString()
      : defaultOpacity.toString(),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.buttons.opacity,
    buttons?.backgroundColor === "transparent"
      ? "0"
      : isDefined(buttons?.opacity)
        ? buttons.opacity.toString()
        : defaultOpacity.toString(),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.buttons.blur,
    isDefined(buttons?.blur)
      ? `${buttons.blur ?? 0}px`
      : defaultBlur.toString(),
  );

  setShadow(
    buttons?.shadow,
    documentStyle,
    botCssVariableNames.chat.buttons.boxShadow,
  );
};

const setButtonsInput = ({
  buttonsInput,
  documentStyle,
}: {
  buttonsInput: ChatTheme["buttonsInput"];
} & CommonProps) => {
  documentStyle.setProperty(
    botCssVariableNames.chat.buttons.flexDirection,
    (buttonsInput?.layout ?? defaultButtonsInputLayout) === "vertical"
      ? "column"
      : "unset",
  );
};

const setInputs = ({
  inputs,
  documentStyle,
  legacyRoundness,
  typebotVersion,
}: {
  inputs: InputTheme | undefined;
  legacyRoundness?: ChatTheme["roundness"];
} & CommonProps) => {
  documentStyle.setProperty(
    botCssVariableNames.chat.inputs.bgColor,
    hexToRgb(inputs?.backgroundColor ?? defaultInputsBackgroundColor).join(
      ", ",
    ),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.inputs.color,
    inputs?.color ?? defaultInputsColor,
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.inputs.placeholderColor,
    inputs?.placeholderColor ?? defaultInputsPlaceholderColor,
  );

  setBorderRadius(
    inputs?.border ?? {
      roundeness: legacyRoundness ?? defaultRoundness,
    },
    documentStyle,
    botCssVariableNames.chat.inputs.borderRadius,
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.inputs.borderWidth,
    `${inputs?.border?.thickness ?? defaultInputsBorderThickness[typebotVersion]}px`,
  );

  const borderHexColor =
    inputs?.border?.color ?? defaultInputsBorderColor[typebotVersion];
  if (isDefined(borderHexColor)) {
    documentStyle.setProperty(
      botCssVariableNames.chat.inputs.borderColor,
      hexToRgb(borderHexColor).join(", "),
    );
  }

  documentStyle.setProperty(
    botCssVariableNames.chat.inputs.borderOpacity,
    isDefined(inputs?.border?.opacity)
      ? inputs.border.opacity.toString()
      : defaultOpacity.toString(),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.inputs.opacity,
    inputs?.backgroundColor === "transparent"
      ? "0"
      : isDefined(inputs?.opacity)
        ? inputs.opacity.toString()
        : defaultOpacity.toString(),
  );

  documentStyle.setProperty(
    botCssVariableNames.chat.inputs.blur,
    isDefined(inputs?.blur) ? `${inputs.blur ?? 0}px` : "none",
  );

  setShadow(
    inputs?.shadow ?? defaultInputsShadow[typebotVersion],
    documentStyle,
    botCssVariableNames.chat.inputs.boxShadow,
  );
};

const setCheckbox = (
  container: ChatTheme["container"],
  generalBackground: GeneralTheme["background"],
  documentStyle: CSSStyleDeclaration,
) => {
  const chatContainerBgColor =
    container?.backgroundColor ?? defaultContainerBackgroundColor;
  const isChatBgTransparent =
    chatContainerBgColor === "transparent" ||
    isEmpty(chatContainerBgColor) ||
    (container?.opacity ?? defaultOpacity) <= 0.2;

  if (isChatBgTransparent) {
    const bgType = generalBackground?.type ?? defaultBackgroundType;
    documentStyle.setProperty(
      botCssVariableNames.chat.checkbox.bgRgb,
      bgType === BackgroundType.IMAGE
        ? "rgba(255, 255, 255, 0.75)"
        : hexToRgb(
            (bgType === BackgroundType.COLOR
              ? generalBackground?.content
              : "#ffffff") ?? "#ffffff",
          ).join(", "),
    );
    if (bgType === BackgroundType.IMAGE) {
      documentStyle.setProperty(
        botCssVariableNames.chat.checkbox.alphaRatio,
        "3",
      );
    } else {
      documentStyle.setProperty(
        botCssVariableNames.chat.checkbox.alphaRatio,
        generalBackground?.content && isLight(generalBackground?.content)
          ? "1"
          : "2",
      );
    }
  } else {
    documentStyle.setProperty(
      botCssVariableNames.chat.checkbox.bgRgb,
      hexToRgb(chatContainerBgColor)
        .concat(container?.opacity ?? 1)
        .join(", "),
    );
    documentStyle.setProperty(
      botCssVariableNames.chat.checkbox.alphaRatio,
      isLight(chatContainerBgColor) ? "1" : "2",
    );
  }
};

export const setGeneralBackground = ({
  background,
  documentStyle,
  typebotVersion,
}: {
  background: Background | undefined;
} & CommonProps) => {
  documentStyle.setProperty(botCssVariableNames.general.bgImage, null);
  documentStyle.setProperty(botCssVariableNames.general.bgColor, null);
  documentStyle.setProperty(
    (background?.type ?? defaultBackgroundType) === BackgroundType.IMAGE
      ? botCssVariableNames.general.bgImage
      : botCssVariableNames.general.bgColor,
    parseBackgroundValue({
      type: background?.type ?? defaultBackgroundType,
      content: background?.content ?? defaultBackgroundColor[typebotVersion],
    }),
  );
};

const parseBackgroundValue = ({
  type,
  content,
}: {
  type: BackgroundType;
  content: NonNullable<Background["content"]>;
}) => {
  switch (type) {
    case BackgroundType.NONE:
      return "transparent";
    case undefined:
    case BackgroundType.COLOR:
      return content;
    case BackgroundType.IMAGE:
      return `url(${content})`;
  }
};

const setBorderRadius = (
  border: ContainerBorderTheme,
  documentStyle: CSSStyleDeclaration,
  variableName: string,
) => {
  switch (border?.roundeness ?? defaultRoundness) {
    case "none": {
      documentStyle.setProperty(variableName, "0");
      break;
    }
    case "medium": {
      documentStyle.setProperty(variableName, "6px");
      break;
    }
    case "large": {
      documentStyle.setProperty(variableName, "20px");
      break;
    }
    case "custom": {
      documentStyle.setProperty(
        variableName,
        `${border.customRoundeness ?? 6}px`,
      );
      break;
    }
  }
};

// Props taken from https://tailwindcss.com/docs/box-shadow
const setShadow = (
  shadow: ContainerTheme["shadow"],
  documentStyle: CSSStyleDeclaration,
  variableName: string,
) => {
  if (shadow === undefined) {
    documentStyle.setProperty(variableName, "0 0 #0000");
    return;
  }
  switch (shadow) {
    case "none":
      documentStyle.setProperty(variableName, "0 0 #0000");
      break;
    case "sm":
      documentStyle.setProperty(variableName, "0 1px 2px 0 rgb(0 0 0 / 0.05)");
      break;
    case "md":
      documentStyle.setProperty(
        variableName,
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      );
      break;
    case "lg":
      documentStyle.setProperty(
        variableName,
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      );
      break;
    case "xl":
      documentStyle.setProperty(
        variableName,
        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      );
      break;
    case "2xl":
      documentStyle.setProperty(
        variableName,
        "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      );
      break;
  }
};
