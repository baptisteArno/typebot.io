import { Sniper } from '@sniper.io/schemas'

export type SniperInDashboard = Pick<Sniper, 'id' | 'name' | 'icon'> & {
  publishedSniperId?: string
}
