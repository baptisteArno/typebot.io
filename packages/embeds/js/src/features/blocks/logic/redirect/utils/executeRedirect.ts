import { RedirectBlock } from '@typebot.io/schemas'

export const executeRedirect = ({
  url,
  isNewTab,
}: RedirectBlock['options'] = {}): { blockedPopupUrl: string } | undefined => {
  if (!url) return
  const updatedWindow = window.open(url, isNewTab ? '_blank' : '_top')
  if (!updatedWindow)
    return {
      blockedPopupUrl: url,
    }
}
