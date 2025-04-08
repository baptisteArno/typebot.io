import { isLight } from "@typebot.io/lib/hexToRgb";
import { isNotDefined, isSvgSrc } from "@typebot.io/lib/utils";
import { colors } from "@typebot.io/ui/colors";
import { cx } from "@typebot.io/ui/lib/cva";
import { Match, Switch } from "solid-js";
import type { BubbleTheme, ButtonTheme } from "../types";

type Props = Pick<BubbleTheme, "placement"> &
  ButtonTheme & {
    isBotOpened: boolean;
    toggleBot: () => void;
    buttonSize: `${number}px`;
  };

const defaultLightIconColor = "#fff";

const isImageSrc = (src: string) =>
  src.startsWith("http") || src.startsWith("data:image/svg+xml");

export const BubbleButton = (props: Props) => (
  <button
    part="button"
    onClick={() => props.toggleBot()}
    class={cx(
      "relative shadow-md rounded-2xl hover:scale-110 active:scale-95 transition-transform duration-200 flex justify-center items-center animate-fade-in",
    )}
    style={{
      "background-color": props.backgroundColor ?? colors.gray.dark["2"],
      color: props.backgroundColor
        ? isLight(props.backgroundColor)
          ? colors.gray.light["12"]
          : colors.gray.dark["12"]
        : colors.gray.dark["12"],
      width: props.buttonSize,
      height: props.buttonSize,
    }}
    aria-label="Open chatbot"
  >
    <OpenIcon {...props} />
    <CloseIcon {...props} />
  </button>
);

const OpenIcon = (props: Props) => (
  <Switch>
    <Match when={isNotDefined(props.customIconSrc)}>
      <svg
        part="button-icon"
        viewBox="0 0 16 16"
        class={cx(
          "fill-transparent absolute duration-200 transition size-6",
          props.isBotOpened ? "scale-0 opacity-0" : "scale-100 opacity-100",
        )}
      >
        <path
          d="M8 15C12.418 15 16 11.866 16 8C16 4.134 12.418 1 8 1C3.582 1 0 4.134 0 8C0 9.76 0.743 11.37 1.97 12.6C1.873 13.616 1.553 14.73 1.199 15.566C1.12 15.752 1.273 15.96 1.472 15.928C3.728 15.558 5.069 14.99 5.652 14.694C6.41791 14.8983 7.20732 15.0012 8 15Z"
          fill="currentColor"
        />
      </svg>
    </Match>
    <Match when={props.customIconSrc && isImageSrc(props.customIconSrc)}>
      <img
        part="button-icon"
        src={props.customIconSrc}
        class={cx(
          "duration-200 transition",
          props.isBotOpened ? "scale-0 opacity-0" : "scale-100 opacity-100",
          isSvgSrc(props.customIconSrc) ? "w-[60%]" : "w-full h-full",
          isSvgSrc(props.customIconSrc) ? "" : "object-cover rounded-2xl",
        )}
        alt="Bubble button icon"
      />
    </Match>
    <Match when={props.customIconSrc && !isImageSrc(props.customIconSrc)}>
      <span
        part="button-icon"
        class={cx(
          "text-4xl duration-200 transition",
          props.isBotOpened ? "scale-0 opacity-0" : "scale-100 opacity-100",
        )}
        style={{
          "font-family":
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        }}
      >
        {props.customIconSrc}
      </span>
    </Match>
  </Switch>
);

const CloseIcon = (props: Props) => (
  <Switch>
    <Match when={isNotDefined(props.customCloseIconSrc)}>
      <svg
        part="button-icon"
        viewBox="0 0 24 24"
        style={{
          fill: defaultLightIconColor,
        }}
        class={cx(
          "absolute duration-200 transition w-[60%]",
          props.isBotOpened
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 -rotate-180 opacity-0",
        )}
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M18.601 8.39897C18.269 8.06702 17.7309 8.06702 17.3989 8.39897L12 13.7979L6.60099 8.39897C6.26904 8.06702 5.73086 8.06702 5.39891 8.39897C5.06696 8.73091 5.06696 9.2691 5.39891 9.60105L11.3989 15.601C11.7309 15.933 12.269 15.933 12.601 15.601L18.601 9.60105C18.9329 9.2691 18.9329 8.73091 18.601 8.39897Z"
        />
      </svg>
    </Match>
    <Match
      when={props.customCloseIconSrc && isImageSrc(props.customCloseIconSrc)}
    >
      <img
        part="button-icon"
        src={props.customCloseIconSrc}
        class={cx(
          "absolute duration-200 transition",
          props.isBotOpened
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 -rotate-180 opacity-0",
          isSvgSrc(props.customCloseIconSrc) ? "w-[60%]" : "w-full h-full",
          isSvgSrc(props.customCloseIconSrc) ? "" : "object-cover rounded-2xl",
        )}
        alt="Bubble button close icon"
      />
    </Match>
    <Match
      when={props.customCloseIconSrc && !isImageSrc(props.customCloseIconSrc)}
    >
      <span
        part="button-icon"
        class={cx(
          "absolute text-4xl duration-200 transition",
          props.isBotOpened
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 -rotate-180 opacity-0",
        )}
        style={{
          "font-family":
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        }}
      >
        {props.customCloseIconSrc}
      </span>
    </Match>
  </Switch>
);
