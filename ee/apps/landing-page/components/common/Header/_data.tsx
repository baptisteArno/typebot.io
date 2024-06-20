import { GitHubIcon } from 'assets/icons'
import { DocIcon } from 'assets/icons/DocIcon'
import { NewspaperIcon } from 'assets/icons/NewspaperIcon'
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
        label: 'Blog',
        description:
          'Read the latest news and updates about Typebot and the chatbots ecosystem',
        href: '/blog',
        icon: <NewspaperIcon />,
      },
      {
        label: 'Community',
        description:
          'Join the Discord server and learn about chatbots best practices and get help from the community',
        href: '/discord',
        icon: <PeopleCircleIcon />,
      },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
]
