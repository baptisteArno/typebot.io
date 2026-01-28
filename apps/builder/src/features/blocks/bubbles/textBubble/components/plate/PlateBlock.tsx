import type { Descendant, TElement, TText } from "@typebot.io/rich-text/plate";
import { PlateText } from "./PlateText";

export const PlateBlock = ({ element }: { element: TElement | TText }) => {
  if (element.text) return <PlateText {...(element as any)} />;
  switch (element.type) {
    case "a": {
      return (
        <a
          href={element.url as string}
          target="_blank"
          className="slate-a"
          rel="noreferrer"
        >
          {(element.children as Descendant[])?.map((child, index) => (
            <PlateBlock
              // biome-ignore lint/suspicious/noArrayIndexKey: slate children order is stable
              key={index}
              element={child}
            />
          ))}
        </a>
      );
    }
    default: {
      return (
        <div>
          {(element.children as Descendant[])?.map((child, index) => (
            <PlateBlock
              // biome-ignore lint/suspicious/noArrayIndexKey: slate children order is stable
              key={index}
              element={child}
            />
          ))}
        </div>
      );
    }
  }
};
