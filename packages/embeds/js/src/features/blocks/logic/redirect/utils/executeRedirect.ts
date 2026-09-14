import type { RedirectBlock } from "@typebot.io/blocks-logic/redirect/schema";
import type { ClientSideActionContext } from "../../../../../types";

export const executeRedirect = (
  { url, isNewTab }: RedirectBlock["options"] = {},
  { isPreview }: Pick<ClientSideActionContext, "isPreview">,
): { blockedPopupUrl: string } | undefined => {
  if (!url) return;
  const updatedWindow = window.open(
    url,
    isPreview || isNewTab ? "_blank" : "_top",
  );
  if (!updatedWindow)
    return {
      blockedPopupUrl: url,
    };
};
