import type { BotProps } from "@typebot.io/js";
import type React from "react";
import { useEffect, useRef } from "react";

type Props = BotProps & {
  style?: React.CSSProperties;
  className?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "typebot-standard": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { class?: string };
    }
  }
}

type StandardElement = HTMLElement & Props;

export const Standard = ({ style, className, ...assignableProps }: Props) => {
  const ref = useRef<StandardElement | null>(null);

  useEffect(() => {
    import("./web");
    if (!ref.current) return;
    const { typebot, ...rest } = assignableProps;
    // We assign typebot last to ensure initializeBot is triggered with all the initial values
    Object.assign(ref.current, rest, { typebot });
  }, [assignableProps]);

  return <typebot-standard ref={ref} style={style} class={className} />;
};
