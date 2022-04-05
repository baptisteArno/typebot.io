import { GitHubIcon } from 'assets/icons'
import { DocIcon } from 'assets/icons/DocIcon'
import { MapIcon } from 'assets/icons/MapIcon'
import { PeopleCircleIcon } from 'assets/icons/PeopleCircleIcon'
import * as React from 'react'

export const links = [
  {
    label: 'Resources',
    children: [
      {
        label: 'GitHub repository',
        description: 'Check out the entire source code of the project',
        href: 'https://github.com/baptisteArno/typebot.io',
        icon: <GitHubIcon fill="blue.300" />,
      },
      {
        label: 'Documentation',
        description:
          "Everything you need to know about how to use Typebot's builder",
        href: 'https://docs.typebot.io',
        icon: <DocIcon />,
      },
      {
        label: 'Roadmap',
        description:
          "Follow the development and make suggestions for which features you'd like to see",
        href: 'https://feedback.typebot.io/roadmap',
        icon: <MapIcon />,
      },
      {
        label: 'Community',
        description:
          'Join our facebook community and get insights on how to create high performing surveys',
        href: 'https://www.facebook.com/groups/262165102257585',
        icon: <PeopleCircleIcon />,
      },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
]
