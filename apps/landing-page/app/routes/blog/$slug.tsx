import codeSnippetsCssUrl from "@/assets/code-snippet.css?url";
import { CommonPageLayout } from "@/components/CommonPageLayout";
import { Mdx } from "@/features/blog/components/mdx";
import { formatDate } from "@/features/blog/helpers";
import { seo } from "@/lib/seo";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { allPosts } from "content-collections";

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: () => ({
    allPosts,
  }),
  loader: async ({ params, context: { allPosts } }) => {
    const post = allPosts.find((post) => post._meta.path === params.slug);

    if (!post) {
      throw redirect({
        to: "/blog",
      });
    }

    return { post };
  },
  head: ({ loaderData }) => ({
    links: [{ rel: "stylesheet", href: codeSnippetsCssUrl }],
    meta: loaderData
      ? [
          ...seo({
            title: `${loaderData?.post.title} | Typebot`,
            description: loaderData?.post.description,
          }),
        ]
      : [],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { post } = Route.useLoaderData();
  return (
    <CommonPageLayout className="max-w-2xl">
      <article className="prose prose-strong:font-medium prose-img:rounded-xl prose-img:max-h-[60vh] prose-img:w-auto prose-video:rounded-xl prose-figure:my-0 prose-a:text-[currentColor]">
        <div>
          {post.postedAt && (
            <time
              dateTime={post.postedAt}
              className="block text-sm text-muted-foreground"
            >
              Published on {formatDate(post.postedAt)}
            </time>
          )}
          <h1 className="my-4 inline-block font-heading text-4xl leading-tight lg:text-5xl">
            {post.title}
          </h1>
        </div>
        <Mdx code={post.mdx} />
      </article>
    </CommonPageLayout>
  );
}
