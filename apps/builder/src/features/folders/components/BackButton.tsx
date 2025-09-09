import { useTranslate } from "@tolgee/react";
import { cn } from "@typebot.io/ui/lib/cn";
import { useMemo } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { ChevronLeftIcon } from "@/components/icons";
import { useTypebotDnd } from "../TypebotDndProvider";

export const BackButton = ({ id }: { id: string | null }) => {
  const { t } = useTranslate();
  const { draggedTypebot, setMouseOverFolderId, mouseOverFolderId } =
    useTypebotDnd();

  const isTypebotOver = useMemo(
    () => draggedTypebot && mouseOverFolderId === id,
    [draggedTypebot, id, mouseOverFolderId],
  );

  const handleMouseEnter = () => setMouseOverFolderId(id);
  const handleMouseLeave = () => setMouseOverFolderId(undefined);
  return (
    <ButtonLink
      href={id ? `/typebots/folders/${id}` : "/typebots"}
      variant={
        isTypebotOver || draggedTypebot ? "outline" : "outline-secondary"
      }
      className={cn(
        "bg-gray-1",
        (isTypebotOver || draggedTypebot) && "border-2 border-orange-8 ",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ChevronLeftIcon />
      {t("back")}
    </ButtonLink>
  );
};
