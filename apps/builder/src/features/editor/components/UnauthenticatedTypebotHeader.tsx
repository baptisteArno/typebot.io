import { useTranslate } from "@tolgee/react";
import { isNotDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Copy01Icon } from "@typebot.io/ui/icons/Copy01Icon";
import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";
import { PlayIcon } from "@typebot.io/ui/icons/PlayIcon";
import { useRouter } from "next/router";
import { ButtonLink } from "@/components/ButtonLink";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { TypebotLogo } from "@/components/TypebotLogo";
import { useUser } from "@/features/user/hooks/useUser";
import { useRightPanel } from "@/hooks/useRightPanel";
import { useEditor } from "../providers/EditorProvider";
import { useTypebot } from "../providers/TypebotProvider";

export const GuestTypebotHeader = () => {
  const { t } = useTranslate();
  const router = useRouter();
  const { user } = useUser();
  const { typebot, save } = useTypebot();
  const { setStartPreviewFrom } = useEditor();
  const [rightPanel, setRightPanel] = useRightPanel();

  const handlePreviewClick = async () => {
    setStartPreviewFrom(undefined);
    save().then();
    setRightPanel("preview");
  };

  return (
    <div className="flex w-full border-b justify-center items-center relative h-(--header-height) bg-gray-1 shrink-0 z-10">
      <div className="items-center gap-2 absolute xl:static right-[280px] xl:right-0 hidden sm:flex">
        <ButtonLink
          href={`/typebots/${typebot?.id}/edit`}
          variant={router.pathname.includes("/edit") ? "outline" : "ghost"}
          size="sm"
        >
          {t("editor.header.flowButton.label")}
        </ButtonLink>
        <ButtonLink
          href={`/typebots/${typebot?.id}/theme`}
          variant={router.pathname.endsWith("theme") ? "outline" : "ghost"}
          size="sm"
        >
          {t("editor.header.themeButton.label")}
        </ButtonLink>
        <ButtonLink
          href={`/typebots/${typebot?.id}/settings`}
          variant={router.pathname.endsWith("settings") ? "outline" : "ghost"}
          size="sm"
        >
          {t("editor.header.settingsButton.label")}
        </ButtonLink>
      </div>
      <div className="flex items-center absolute justify-center gap-6 left-4">
        <div className="flex items-center gap-3">
          {typebot && (
            <EmojiOrImageIcon
              icon={typebot.icon}
              defaultIcon={LayoutBottomIcon}
            />
          )}
          <p className="max-w-[150px] overflow-hidden text-[14px] min-w-[30px] min-h-[20px] line-clamp-2">
            {typebot?.name}
          </p>
        </div>
      </div>
      <div className="items-center absolute gap-4 right-4 hidden sm:flex">
        <div className="flex items-center gap-2">
          {typebot?.id && (
            <ButtonLink
              href={
                !user
                  ? {
                      pathname: `/register`,
                      query: {
                        redirectPath: `/typebots/${typebot.id}/duplicate`,
                      },
                    }
                  : `/typebots/${typebot.id}/duplicate`
              }
              variant="secondary"
              disabled={isNotDefined(typebot)}
              size="sm"
            >
              <Copy01Icon />
              Duplicate
            </ButtonLink>
          )}
          {router.pathname.includes("/edit") && isNotDefined(rightPanel) && (
            <Button
              onClick={handlePreviewClick}
              disabled={isNotDefined(typebot)}
              size="sm"
            >
              <PlayIcon />
              Play bot
            </Button>
          )}
        </div>

        {!user && (
          <>
            <hr className="h-6 w-px border-0 bg-gray-6" />
            <ButtonLink
              href={`/register`}
              variant="outline-secondary"
              size="sm"
            >
              <TypebotLogo />
              Try Typebot
            </ButtonLink>
          </>
        )}
      </div>
    </div>
  );
};
