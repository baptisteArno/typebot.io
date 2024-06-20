import { LinkedSniper } from '@/providers/SniperProvider'
import { LogicState } from '@/types'
import { SniperLinkBlock, Sniper, PublicSniper } from '@sniper.io/schemas'
import { sendRequest } from '@sniper.io/lib'

export const fetchAndInjectSniper = async (
  block: SniperLinkBlock,
  { apiHost, injectLinkedSniper, isPreview }: LogicState
): Promise<LinkedSniper | undefined> => {
  const { data, error } = isPreview
    ? await sendRequest<{ sniper: Sniper }>(
        `/api/snipers/${block.options?.sniperId}`
      )
    : await sendRequest<{ sniper: PublicSniper }>(
        `${apiHost}/api/publicSnipers/${block.options?.sniperId}`
      )
  if (!data || error) return
  return injectLinkedSniper(data.sniper)
}
