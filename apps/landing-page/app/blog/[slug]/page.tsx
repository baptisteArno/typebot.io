import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPosts } from '@/app/db/blog'
import { Post } from './Post'
import { serialize } from 'next-mdx-remote/serialize'
import '@/assets/prose.css'
import { env } from '@typebot.io/env'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata | undefined> {
  const post = getBlogPosts().find(
    (post) => post.slug === params.slug && post.metadata.publishedAt
  )
  if (!post) {
    return
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  const ogImage = image
    ? `${env.LANDING_PAGE_URL}${image}`
    : `${env.LANDING_PAGE_URL}/og?title=${title}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${env.LANDING_PAGE_URL}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Blog({ params }: { params: { slug: string } }) {
  const post = getBlogPosts().find(
    (post) => post.slug === params.slug && post.metadata.publishedAt
  )

  if (!post) {
    notFound()
  }

  const mdxSource = await serialize(post.content)

  return <Post metadata={post.metadata} mdxSource={mdxSource} />
}
