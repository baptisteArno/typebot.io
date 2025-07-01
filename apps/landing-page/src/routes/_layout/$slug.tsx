import codeSnippetsCssUrl from "@/assets/code-snippet.css?url";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { allPosts } from "@/content-collections";
import { Mdx } from "@/features/blog/components/mdx";
import { createMetaTags } from "@/lib/createMetaTags";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/$slug")({
  loader: async ({ params }) => {
    const post = allPosts.find((post) => post._meta.path.endsWith(params.slug));

    if (!post) {
      throw redirect({
        to: "/",
      });
    }

    return { post };
  },
  head: ({ loaderData }) => ({
    links: [{ rel: "stylesheet", href: codeSnippetsCssUrl }],
    meta: loaderData
      ? [
          ...createMetaTags({
            title: `${loaderData?.post.title} | Typebot`,
            description: loaderData.post.description,
            imagePath: "/images/default-og.png",
            path: `/${loaderData.post._meta.path}`,
          }),
        ]
      : [],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { post } = Route.useLoaderData();
  return (
    <ContentPageWrapper className="max-w-2xl">
      <article className="prose prose-strong:font-medium prose-img:rounded-xl prose-img:max-h-[60vh] prose-img:w-auto prose-video:rounded-xl prose-figure:my-0 prose-a:text-[currentColor]">
        <div>
          <h1 className="my-4 inline-block font-heading text-4xl leading-tight lg:text-5xl">
            {post.title}
          </h1>
        </div>
        <Mdx code={post.mdx} />
      </article>
    </ContentPageWrapper>
  );
}
