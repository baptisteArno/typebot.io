'use client'

import { Link } from '@chakra-ui/next-js'
import { Heading, Stack, Text } from '@chakra-ui/react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { highlight } from 'sugar-high'

type Props = {
  metadata: {
    title: string
    publishedAt: string
  }
  mdxSource: MDXRemoteSerializeResult
}

export const Post = ({ metadata, mdxSource }: Props) => (
  <Stack spacing={10} my="20">
    <Stack mx="auto" w="full" maxW="65ch">
      <Heading>{metadata.title}</Heading>
      <Text>{formatDate(metadata.publishedAt)}</Text>
    </Stack>
    <Stack
      mx="auto"
      spacing={0}
      as="article"
      className="prose prose-quoteless prose-neutral prose-invert"
    >
      <MDXRemote
        {...mdxSource}
        components={{
          h1: (props) => <Heading as="h1" {...props} />,
          h2: (props) => <Heading as="h2" {...props} />,
          h3: (props) => <Heading as="h3" {...props} />,
          h4: (props) => <Heading as="h4" {...props} />,
          h5: (props) => <Heading as="h5" {...props} />,
          h6: (props) => <Heading as="h6" {...props} />,
          code: ({ children, ...props }) => {
            const codeHTML = highlight(children?.toString() ?? '')
            return (
              <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
            )
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          link: (props: any) => <Link {...props} />,
        }}
      />
    </Stack>
  </Stack>
)

function formatDate(date: string) {
  const currentDate = new Date().getTime()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  const targetDate = new Date(date).getTime()
  const timeDifference = Math.abs(currentDate - targetDate)
  const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

  const fullDate = new Date(date).toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (daysAgo < 1) {
    return 'Today'
  } else if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`
  } else if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7)
    return `${fullDate} (${weeksAgo}w ago)`
  } else if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30)
    return `${fullDate} (${monthsAgo}mo ago)`
  } else {
    const yearsAgo = Math.floor(daysAgo / 365)
    return `${fullDate} (${yearsAgo}y ago)`
  }
}
