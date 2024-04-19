import { getBlogPosts } from '@/app/db/blog'
import { Posts } from './Posts'

export const metadata = {
  title: 'Blog',
  description: 'Read my thoughts on software development, design, and more.',
}

export default function Home() {
  const allBlogs = getBlogPosts()

  return <Posts allBlogs={allBlogs} />
}
