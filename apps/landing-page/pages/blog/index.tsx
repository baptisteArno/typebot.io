import React from 'react'
import {
  Box,
  Heading,
  Image,
  Text,
  Container,
  VStack,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react'
import { getDatabase } from '../../lib/notion'
import {
  DatePropertyValue,
  Page,
  RichText,
  RichTextPropertyValue,
  TitlePropertyValue,
} from '@notionhq/client/build/src/api-types'
import { NotionText } from 'notion-blocks-chakra-ui'
import { Footer } from 'components/common/Footer'
import { Navbar } from 'components/common/Navbar/Navbar'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import { SocialMetaTags } from 'components/common/SocialMetaTags'

const ArticleList = ({ posts }: { posts: Page[] }) => {
  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        w="full"
        flexDir="column"
      >
        <SocialMetaTags
          title="Blog"
          description="Keep up to date with the latest news related to Typebot. Learn
            about conversationnal forms and how to convert more."
          currentUrl={`https://www.typebot.io/blog`}
          imagePreviewUrl={`https://www.typebot.io/images/previews/blog.png`}
        />
        <Navbar />
        <VStack maxW="1200px" mt={20} pb={56}>
          <VStack maxW="700px">
            <Heading as="h1" fontSize="5xl">
              Blog
            </Heading>
            <Heading
              fontSize="md"
              fontWeight="normal"
              textAlign="center"
              textColor="gray.500"
            >
              Keep up to date with the latest news related to Typebot. Learn
              about conversationnal forms and how to convert more.
            </Heading>
          </VStack>

          <Container maxW="1200px">
            <SimpleGrid columns={[1, 2, 3]} mt={6} py={4} spacing={10}>
              {posts.map((post) => (
                <BlogPost
                  key={post.id}
                  slug={`/${
                    (post.properties.Slug as RichTextPropertyValue).rich_text[0]
                      ?.plain_text
                  }`}
                  title={
                    (post.properties.Name as TitlePropertyValue).title[0]
                      ?.plain_text
                  }
                  description={
                    (post.properties.Description as RichTextPropertyValue)
                      .rich_text
                  }
                  imageSrc={
                    (post.properties.Thumbnail as RichTextPropertyValue)
                      .rich_text[0]?.plain_text
                  }
                  date={
                    new Date(
                      (post.properties.Created as DatePropertyValue)?.date
                        ?.start ?? ''
                    )
                  }
                />
              ))}
            </SimpleGrid>
          </Container>
        </VStack>
      </Flex>
      <Footer />
    </>
  )
}

type BlogPostProps = {
  slug: string
  title: string
  description: RichText[]
  imageSrc: string
  date: Date
}

const BlogPost = ({
  slug,
  title,
  description,
  imageSrc,
  date,
}: BlogPostProps) => (
  <NextChakraLink
    href={'/blog' + slug}
    w="100%"
    shadow="lg"
    p={4}
    rounded="lg"
    _hover={{ textDecoration: 'none' }}
  >
    <Box borderRadius="lg" overflow="hidden">
      <Image
        transform="scale(1.0)"
        src={imageSrc}
        objectFit="contain"
        width="100%"
        transition="0.3s ease-in-out"
        _hover={{
          transform: 'scale(1.05)',
        }}
        alt="title thumbnail"
      />
    </Box>
    <Heading fontSize="xl" marginTop="4">
      {title}
    </Heading>
    <NotionText text={description} as="p" fontSize="md" marginTop="2" />
    <Text textColor="gray.400" fontSize="sm" mt={2}>
      {date.toDateString()}
    </Text>
  </NextChakraLink>
)

export const getStaticProps = async () => {
  if (!process.env.NOTION_DATABASE_ID)
    throw new Error("Couldn't find NOTION_DATABASE_ID")
  const database = await getDatabase(process.env.NOTION_DATABASE_ID)
  return {
    props: {
      posts: database,
    },
    revalidate: 1,
  }
}

export default ArticleList
