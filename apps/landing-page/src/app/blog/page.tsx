import { Posts } from "@/features/blog/components/Posts";
import type { BlogPost, BlogPostModel } from "@/features/blog/types";
import glob from "fast-glob";

const importPost = async (postFilename: string): Promise<BlogPost> => {
  const slug = postFilename
    .replace(/(\/page)?\.mdx$/, "")
    .split("/")
    .pop();
  if (!slug)
    throw new Error(`Could not parse slug from filename: ${postFilename}`);
  const postModule = await import(`${postFilename}`);
  const postModel = postModule.post as BlogPostModel;
  return {
    slug,
    ...postModel,
  };
};

const findAllPosts = async (): Promise<BlogPost[]> => {
  const postFilenames = await glob("**/page.mdx", {
    cwd: ".",
  });
  return await Promise.all(postFilenames.map(importPost));
};

export const metadata = {
  title: "Typebot Blog",
  description:
    "The official Typebot blog where we share our thoughts and tips on everything related to chatbots, conversational marketing, customer support and more.",
};

export default async function Home() {
  const posts = await findAllPosts();

  return <Posts posts={posts} />;
}
