import { env } from "@typebot.io/env";
import type { BlogPost } from "./types";

export const generateMetadata = (post: BlogPost) => {
  const ogImage = post.image
    ? `${env.LANDING_PAGE_URL}${post.image}`
    : `${env.LANDING_PAGE_URL}/og?title=${post.title}`;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      publishedTime: post.postedAt?.toISOString(),
      url: `${env.LANDING_PAGE_URL}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
};
