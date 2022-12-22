import { RedirectOptions } from 'models'

export const executeRedirect = ({ url, isNewTab }: RedirectOptions) => {
  if (!url) return
  window.open(url, isNewTab ? '_blank' : '_self')
}
