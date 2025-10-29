import { useTranslate } from "@tolgee/react";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRouter } from "next/router";
import { stringify } from "qs";
import { useTypebotDnd } from "../TypebotDndProvider";

export const CreateBotButton = ({
  folderId,
  ...props
}: { folderId?: string } & ButtonProps) => {
  const { t } = useTranslate();
  const router = useRouter();
  const { draggedTypebot } = useTypebotDnd();

  const handleClick = () =>
    router.push(
      `/typebots/create?${stringify({
        folderId,
      })}`,
    );

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "px-6 whitespace-normal w-[225px] h-[270px] [&_svg]:size-10",
        draggedTypebot && "opacity-30",
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-6">
        <PlusSignIcon />
        <p className="font-medium max-w-40 text-center mt-6 text-lg">
          {t("folders.createTypebotButton.label")}
        </p>
      </div>
    </Button>
  );
};
