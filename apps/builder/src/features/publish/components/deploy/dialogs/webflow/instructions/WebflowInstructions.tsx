import { WebflowBubbleInstructions } from "./WebflowBubbleInstructions";
import { WebflowPopupInstructions } from "./WebflowPopupInstructions";
import { WebflowStandardInstructions } from "./WebflowStandardInstructions";

type WebflowInstructionsProps = {
  type: "standard" | "popup" | "bubble";
};

export const WebflowInstructions = ({ type }: WebflowInstructionsProps) => {
  switch (type) {
    case "standard": {
      return <WebflowStandardInstructions />;
    }
    case "popup": {
      return <WebflowPopupInstructions />;
    }
    case "bubble": {
      return <WebflowBubbleInstructions />;
    }
  }
};
