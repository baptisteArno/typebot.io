import { GetStaticPropsContext } from 'next'
import { NotionBlock, NotionText } from 'notion-blocks-chakra-ui'
import React from 'react'
import { getPage, getBlocks, getFullDatabase } from '../../lib/notion'
import Image from 'next/image'
import {
  Stack,
  Container,
  Button,
  VStack,
  Heading,
  HStack,
  Text,
} from '@chakra-ui/react'
import {
  Page,
  Block,
  TitlePropertyValue,
  RichTextPropertyValue,
  CheckboxPropertyValue,
} from '@notionhq/client/build/src/api-types'
import { Footer } from 'components/common/Footer'
import { Navbar } from 'components/common/Navbar/Navbar'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import { SocialMetaTags } from 'components/common/SocialMetaTags'

export default function Post({
  page,
  blocks,
}: {
  page: Page
  blocks: Block[]
}) {
  return (
    <>
      <Stack
        alignItems="center"
        w="full"
        overflowX="hidden"
        pb={20}
        minH="calc(100vh - 267px)"
        spacing={10}
      >
        {page && (
          <SocialMetaTags
            title={
              (page.properties.Name as TitlePropertyValue).title[0]?.plain_text
            }
            description={
              (page.properties.Description as RichTextPropertyValue)
                .rich_text[0]?.plain_text
            }
            currentUrl={`https://www.typebot.io/blog/${
              (page.properties.Slug as RichTextPropertyValue).rich_text[0]
                ?.plain_text
            }`}
            imagePreviewUrl={
              (page.properties.Thumbnail as RichTextPropertyValue).rich_text[0]
                ?.plain_text
            }
          />
        )}
        <Navbar />

        <Container as="article" maxW="900px">
          {((page?.properties?.Published as CheckboxPropertyValue | undefined)
            ?.checkbox ||
            !page) && (
            <Button
              as={NextChakraLink}
              href="/blog"
              colorScheme="gray"
              variant="outline"
              size="sm"
            >
              {'<'} Blog
            </Button>
          )}
          {page ? (
            <>
              <VStack>
                <Heading as="h1" fontSize="5xl" textAlign="center" mt={6}>
                  <NotionText
                    text={(page.properties.Name as TitlePropertyValue).title}
                  />
                </Heading>
                <Heading
                  fontSize="md"
                  fontWeight="normal"
                  textAlign="center"
                  textColor="gray.500"
                >
                  <NotionText
                    text={
                      (page.properties.Description as RichTextPropertyValue)
                        .rich_text
                    }
                  />
                </Heading>
                {(page.properties.Author as RichTextPropertyValue | undefined)
                  ?.rich_text[0]?.plain_text && (
                  <Author
                    author={
                      (page.properties.Author as RichTextPropertyValue)
                        .rich_text[0]?.plain_text
                    }
                  />
                )}
              </VStack>
              <Stack mt={6} spacing={4} maxW="700px" mx="auto">
                {blocks.map((block) => (
                  <NotionBlock key={block.id} block={block} />
                ))}
              </Stack>
            </>
          ) : (
            <Text textAlign="center">Blog post not found</Text>
          )}
        </Container>
      </Stack>
      <Footer />
    </>
  )
}

export const getStaticPaths = async () => {
  if (!process.env.NOTION_DATABASE_ID)
    throw new Error("Couldn't find NOTION_DATABASE_ID")
  const database = await getFullDatabase(process.env.NOTION_DATABASE_ID)
  return {
    paths: database.filter(pageWithSlugAndId).map((page) => ({
      params: {
        slug: (page.properties.Slug as RichTextPropertyValue).rich_text[0]
          .plain_text,
        id: page.id,
      },
    })),
    fallback: true,
  }
}

const pageWithSlugAndId = (page: Page) =>
  (page.properties.Slug as RichTextPropertyValue).rich_text[0]?.plain_text &&
  page.id

const Author = ({ author }: { author: string }) => {
  return (
    <HStack>
      <Image
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        src={/\(([^)]+)\)/.exec(author)![0].slice(1, -1)}
        width="30px"
        height="30px"
        className="rounded-full"
        alt="Author's picture"
      />
      <Text>{author.split(' (')[0]}</Text>
    </HStack>
  )
}
export const getStaticProps = async (
  context: GetStaticPropsContext<{ slug: string; locale: 'fr' | 'en' }>
) => {
  if (!process.env.NOTION_DATABASE_ID)
    throw new Error("Couldn't find NOTION_DATABASE_ID")
  if (!context.params) throw new Error("Couldn't find params")
  const { slug } = context.params
  const page = await getPage(process.env.NOTION_DATABASE_ID, slug)
  if (!page?.id) return
  const blocks = await getBlocks(page?.id)

  const childBlocks = await Promise.all(
    blocks
      .filter((block) => block.has_children)
      .map(async (block) => {
        return {
          id: block.id,
          children: await getBlocks(block.id),
        }
      })
  )
  const blocksWithChildren = blocks.map((block) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (block.has_children && !block[block.type].children) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      block[block.type]['children'] = childBlocks.find(
        (x) => x.id === block.id
      )?.children
    }
    return block
  })

  return {
    props: {
      page,
      blocks: blocksWithChildren,
    },
    revalidate: 1,
  }
}
