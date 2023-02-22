import { GlobeIcon, CodeIcon } from '@/components/icons'

export const runtimes = [
  {
    name: 'Web',
    icon: <GlobeIcon />,
  },
  { name: 'API', icon: <CodeIcon />, status: 'beta' },
] as const
