import { BubbleMenuButton } from "./BubbleMenuButton";
import { PopupMenuButton } from "./PopupMenuButton";
import { StandardMenuButton } from "./StandardMenuButton";

type Props = {
  onSelectEmbedType: (type: "standard" | "popup" | "bubble") => void;
};

export const EmbedTypeMenu = ({ onSelectEmbedType }: Props) => {
  return (
    <div className="flex items-center gap-4">
      <StandardMenuButton onClick={() => onSelectEmbedType("standard")} />
      <PopupMenuButton onClick={() => onSelectEmbedType("popup")} />
      <BubbleMenuButton onClick={() => onSelectEmbedType("bubble")} />
    </div>
  );
};
