import { getBlogPosts } from "@/app/db/blog";
import { Posts } from "./Posts";

export const metadata = {
  title: "Typebot Blog",
  description:
    "The official Typebot blog where we share our thoughts and tips on everything related to chatbots, conversational marketing, customer support and more.",
};

export default function Home() {
  const allBlogs = getBlogPosts();

  return <Posts allBlogs={allBlogs} />;
}
