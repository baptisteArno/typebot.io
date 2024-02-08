import { createBlock } from '@typebot.io/forge'
import { ElevenlabsLogo, ElevenlabsLogoDark } from './logo'
import { auth } from './auth'
import { convertTextToSpeech } from './actions/convertTextToSpeech'

export const elevenlabs = createBlock({
  id: 'elevenlabs',
  name: 'ElevenLabs',
  tags: ['ai', 'voice', 'generation'],
  fullName:
    'Create and use natural AI voices instantly in any language of your choice to send to your users',
  LightLogo: ElevenlabsLogo,
  DarkLogo: ElevenlabsLogoDark,
  auth,
  actions: [convertTextToSpeech],
  docsUrl: 'https://docs.typebot.io/forge/blocks/elevenlabs',
})
