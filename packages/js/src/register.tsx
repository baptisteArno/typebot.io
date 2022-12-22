/* eslint-disable solid/reactivity */
import { customElement } from 'solid-element'
import { Bot, BotProps } from './components/Bot'

export const registerWebComponents = (props: BotProps) => {
  customElement('typebot-standard', props, Bot)
}
