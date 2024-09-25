import type { RedirectBlock } from "@typebot.io/blocks-logic/redirect/schema";

export const executeRedirect = ({
  url,
  isNewTab,
}: RedirectBlock["options"] = {}): { blockedPopupUrl: string } | undefined => {
  if (!url) return;
  const updatedWindow = window.open(url, isNewTab ? "_blank" : "_top");
  if (!updatedWindow)
    return {
      blockedPopupUrl: url,
    };
};
