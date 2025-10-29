import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import type { TypebotInDashboard } from "@/features/dashboard/types";

type Props = {
  typebot: TypebotInDashboard;
  className?: string;
  onMouseUp?: () => Promise<void>;
  style?: React.CSSProperties;
};

export const TypebotButtonOverlay = ({
  typebot,
  className,
  onMouseUp,
  style,
}: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-center w-[225px] h-[270px] border rounded-md shadow-md whitespace-normal transition-none pointer-events-none opacity-70 bg-gray-1",
        className,
      )}
      onMouseUp={onMouseUp}
      style={style}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex rounded-full justify-center items-center text-4xl">
          <EmojiOrImageIcon
            icon={typebot.icon}
            size="lg"
            defaultIcon={LayoutBottomIcon}
          />
        </div>
        <p className="font-medium">{typebot.name}</p>
      </div>
    </div>
  );
};
