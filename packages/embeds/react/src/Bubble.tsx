import { type BubbleProps, resolveButtonSize } from "@typebot.io/js";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";

type Props = BubbleProps & {
  inlineStyle?: {
    [key: string]: string;
  };
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "typebot-bubble": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

type BubbleElement = HTMLElement & Props;

export const Bubble = (props: Props) => {
  const ref = useRef<BubbleElement | null>(null);

  useEffect(() => {
    import("./web");
  }, []);

  useEffect(() => {
    if (props.theme?.position === "static" && !ref.current) return;
    if (!ref.current) {
      ref.current = document.createElement("typebot-bubble") as BubbleElement;
      document.body.prepend(ref.current);
    }
    const { typebot, ...rest } = props;
    // We assign typebot last to ensure initializeBubble is triggered with all the initial values
    Object.assign(ref.current, rest, { typebot });
  }, [props]);

  useEffect(() => {
    return () => {
      if (props.theme?.position === "static") return;
      ref.current?.remove();
      ref.current = null;
    };
  }, [props.theme?.position]);

  const buttonSize = useMemo(() => {
    return resolveButtonSize(props.theme?.button?.size);
  }, [props.theme?.button?.size]);

  if (props.theme?.position === "static")
    return (
      <typebot-bubble
        ref={ref}
        style={{
          display: "inline-flex",
          width: buttonSize,
          height: buttonSize,
        }}
      />
    );
  return null;
};
