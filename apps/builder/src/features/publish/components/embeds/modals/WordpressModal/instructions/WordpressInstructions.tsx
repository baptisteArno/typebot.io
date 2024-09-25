import { WordpressBubbleInstructions } from "./WordpressBubbleInstructions";
import { WordpressPopupInstructions } from "./WordpressPopupInstructions";
import { WordpressStandardInstructions } from "./WordpressStandardInstructions";

type Props = {
  publicId: string;
  type: "standard" | "popup" | "bubble";
};

export const WordpressInstructions = ({ publicId, type }: Props) => {
  switch (type) {
    case "standard": {
      return <WordpressStandardInstructions publicId={publicId} />;
    }
    case "popup": {
      return <WordpressPopupInstructions publicId={publicId} />;
    }
    case "bubble": {
      return <WordpressBubbleInstructions publicId={publicId} />;
    }
  }
};
