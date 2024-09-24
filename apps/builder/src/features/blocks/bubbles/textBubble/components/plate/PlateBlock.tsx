import type { TDescendant, TElement, TText } from "@udecode/plate-common";
import { PlateText } from "./PlateText";

export const PlateBlock = ({ element }: { element: TElement | TText }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          {(element.children as TDescendant[])?.map((child, idx) => (
            <PlateBlock key={idx} element={child} />
          ))}
        </a>
      );
    }
    default: {
      return (
        <div>
          {(element.children as TDescendant[])?.map((child, idx) => (
            <PlateBlock key={idx} element={child} />
          ))}
        </div>
      );
    }
  }
};
