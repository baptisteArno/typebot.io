import { ScriptBubbleInstructions } from "./ScriptBubbleInstructions";
import { ScriptPopupInstructions } from "./ScriptPopupInstructions";
import { ScriptStandardInstructions } from "./ScriptStandardInstructions";

type Props = {
  type: "standard" | "popup" | "bubble";
};

export const ScriptInstructions = ({ type }: Props) => {
  switch (type) {
    case "standard": {
      return <ScriptStandardInstructions />;
    }
    case "popup": {
      return <ScriptPopupInstructions />;
    }
    case "bubble": {
      return <ScriptBubbleInstructions />;
    }
  }
};
