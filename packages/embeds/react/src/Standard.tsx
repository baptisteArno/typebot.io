import type { BotProps } from "@typebot.io/js";
import type React from "react";
import { useEffect, useRef } from "react";
import "@typebot.io/js/web";

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
    if (!ref.current) return;
    Object.assign(ref.current, assignableProps);
  }, [assignableProps]);

  return <typebot-standard ref={ref} style={style} class={className} />;
};

export default Standard;
