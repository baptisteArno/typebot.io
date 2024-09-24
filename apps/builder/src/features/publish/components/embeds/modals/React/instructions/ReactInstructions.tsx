import { ReactBubbleInstructions } from "./ReactBubbleInstructions";
import { ReactPopupInstructions } from "./ReactPopupInstructions";
import { ReactStandardInstructions } from "./ReactStandardInstructions";

type Props = {
  type: "standard" | "popup" | "bubble";
};

export const ReactInstructions = ({ type }: Props) => {
  switch (type) {
    case "standard": {
      return <ReactStandardInstructions />;
    }
    case "popup": {
      return <ReactPopupInstructions />;
    }
    case "bubble": {
      return <ReactBubbleInstructions />;
    }
  }
};
