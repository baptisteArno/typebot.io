import codeSnippetsCssUrl from "@/assets/code-snippet.css?url";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { TextLink } from "@/components/link";
import { allPosts } from "@/content-collections";
import { Mdx } from "@/features/blog/components/mdx";
import { authors } from "@/features/blog/data/authors";
import { formatDate } from "@/features/blog/helpers";
import { createMetaTags } from "@/lib/createMetaTags";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { cx } from "@typebot.io/ui/lib/cva";

export const Route = createFileRoute("/_layout/blog/$slug")({
  loader: async ({ params }) => {
    const post = allPosts.find((post) => post._meta.path.endsWith(params.slug));

    if (!post) {
      throw redirect({
        to: "/blog",
      });
    }

    return { post, author: authors[post.author as keyof typeof authors] };
  },
  head: ({ loaderData }) => ({
    links: [{ rel: "stylesheet", href: codeSnippetsCssUrl }],
    meta: loaderData
      ? [
          ...createMetaTags({
            title: `${loaderData?.post.title} | Typebot`,
            description: loaderData?.post.description,
            imagePath: loaderData?.post.cover ?? "/images/default-og.png",
            path: `/${loaderData.post._meta.path}`,
          }),
        ]
      : [],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { post, author } = Route.useLoaderData();
  return (
    <ContentPageWrapper className="max-w-2xl">
      <article
        className={cx(
          "prose prose-p:text-lg prose-strong:font-medium prose-video:rounded-xl prose-a:text-[currentColor] ",
          "prose-figure:my-0 prose-img:rounded-xl prose-img:max-h-[60vh] prose-img:w-auto",
          "prose-code:bg-gray-4 prose-code:rounded-md prose-code:text-orange-10 prose-code:border prose-code:border-gray-6 prose-code:p-1 prose-code:py-0.5 prose-code:font-normal",
        )}
      >
        <div>
          <span className="inline-flex gap-1 items-center not-prose text-sm">
            {post.postedAt && (
              <time dateTime={post.postedAt} className="block ">
                Published on {formatDate(post.postedAt)}
              </time>
            )}
            • Written by
            <img
              src={author.imageSrc}
              alt={author.name}
              className="size-6 rounded-full"
            />
            <TextLink href={author.url}>{author.name}</TextLink>
          </span>
          <h1 className="my-4 inline-block font-heading text-4xl leading-tight lg:text-5xl">
            {post.title}
          </h1>
        </div>
        <Mdx code={post.mdx} />
      </article>
    </ContentPageWrapper>
  );
}
