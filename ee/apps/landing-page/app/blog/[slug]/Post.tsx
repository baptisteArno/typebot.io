/* eslint-disable jsx-a11y/alt-text */
'use client'

import { Link } from '@chakra-ui/next-js'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { highlight } from 'sugar-high'
import { Tweet } from './Tweet'
import { Standard } from '@typebot.io/nextjs'
import { EndCta } from '@/components/Homepage/EndCta'
import { Table } from './Table'
import Image from 'next/image'

type Props = {
  metadata: {
    title: string
    publishedAt: string
  }
  mdxSource: MDXRemoteSerializeResult
}

export const Post = ({ metadata, mdxSource }: Props) => (
  <Stack spacing={10} my="20" w="full">
    <Stack mx="auto" w="full" maxW={['full', '46rem']} px={[3, 3, 0]}>
      <Heading>{metadata.title}</Heading>
      <Text>{formatDate(metadata.publishedAt)}</Text>
    </Stack>
    <Stack
      mx="auto"
      spacing={0}
      as="article"
      px={3}
      w="full"
      className="prose prose-quoteless prose-neutral prose-invert max-w-none"
    >
      <MDXRemote
        {...mdxSource}
        components={{
          h1: (props) => <Heading as="h1" {...props} />,
          h2: (props) => <Heading as="h2" fontSize="3xl" {...props} />,
          h3: (props) => <Heading as="h3" fontSize="2xl" {...props} />,
          h4: (props) => <Heading as="h4" fontSize="xl" {...props} />,
          h5: (props) => <Heading as="h5" fontSize="lg" {...props} />,
          h6: (props) => <Heading as="h6" fontSize="md" {...props} />,
          code: ({ children, ...props }) => {
            if (!props.className || props.className?.includes('md'))
              return <code {...props}>{children}</code>
            const hightlightedCode = highlight(children?.toString() ?? '')
            return (
              <code
                dangerouslySetInnerHTML={{ __html: hightlightedCode }}
                {...props}
              />
            )
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          link: (props: any) => <Link {...props} />,
          Image: (props) => (
            <Image
              style={{
                borderRadius: '.5rem',
                ...props.style,
              }}
              {...props}
            />
          ),
          Callout: ({ children, title, ...props }) => (
            <Alert rounded="md" {...props}>
              <AlertIcon />
              {title ? <AlertTitle>{title}</AlertTitle> : null}
              {children}
            </Alert>
          ),
          Tweet,
          Typebot: (props) => (
            <Standard
              style={{
                borderRadius: '0.375rem',
                borderWidth: '1px',
                height: '533px',
                ...props.style,
              }}
              {...props}
            />
          ),
          Youtube: ({ id }: { id: string }) => (
            <div className="w-full">
              <div
                style={{
                  position: 'relative',
                  paddingBottom: '64.63195691202873%',
                  height: 0,
                  width: '100%',
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                ></iframe>
              </div>
            </div>
          ),
          Loom: ({ id }: { id: string }) => (
            <div className="w-full">
              <div
                style={{
                  position: 'relative',
                  paddingBottom: '64.63195691202873%',
                  height: 0,
                  width: '100%',
                }}
              >
                <iframe
                  src={`https://www.loom.com/embed/${id}`}
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                ></iframe>
              </div>
            </div>
          ),
          Cta: (props) => (
            <EndCta
              style={{ maxWidth: 'none', ...props.style }}
              w="full"
              h="auto"
              py="0"
              className="w-full"
              bgGradient={undefined}
              polygonsBaseTop="0px"
              {...props}
            />
          ),
          Table,
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
