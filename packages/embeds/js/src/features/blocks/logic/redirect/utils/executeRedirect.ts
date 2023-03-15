import type { RedirectOptions } from '@typebot.io/schemas'

export const executeRedirect = ({
  url,
  isNewTab,
}: RedirectOptions): { blockedPopupUrl: string } | undefined => {
  if (!url) return
  const updatedWindow = window.open(url, isNewTab ? '_blank' : '_self')
  if (!updatedWindow)
    return {
      blockedPopupUrl: url,
    }
}
