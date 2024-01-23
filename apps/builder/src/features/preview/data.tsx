import { GlobeIcon, CodeIcon } from '@/components/icons'
import { WhatsAppLogo } from '@/components/logos/WhatsAppLogo'

export const runtimes = [
  {
    name: 'Web',
    icon: <GlobeIcon />,
  },
  {
    name: 'WhatsApp',
    icon: <WhatsAppLogo />,
  },
  { name: 'API', icon: <CodeIcon /> },
] as const
