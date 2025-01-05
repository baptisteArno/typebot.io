import { isDefined } from "@typebot.io/lib/utils";
import Link from "next/link";
import type { BlogPost } from "../types";

type Props = {
  posts: BlogPost[];
};

export const Posts = ({ posts }: Props) => (
  <div className="flex flex-col gap-10 my-20 w-full mx-auto text-justify">
    <h2>Latest blog posts:</h2>
    <div className="flex flex-col">
      {posts
        .filter((post) => isDefined(post.postedAt))
        .sort((a, b) => {
          if (new Date(a.postedAt!) > new Date(b.postedAt!)) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="flex flex-col gap-4 p-4 border border-gray-8 rounded-md">
              <h2>{post.title}</h2>
              <p>{new Date(post.postedAt!).toDateString()}</p>
            </div>
          </Link>
        ))}
    </div>
  </div>
);
