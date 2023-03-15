import { Typebot } from '@typebot.io/schemas'

export type TypebotInDashboard = Pick<Typebot, 'id' | 'name' | 'icon'> & {
  publishedTypebotId?: string
}
