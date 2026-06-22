import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import codeSnippetsCssUrl from "@/assets/code-snippet.css?url";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { currentBaseUrl } from "@/constants";
import { Mdx } from "@/features/blog/components/mdx";
import { createMetaTags } from "@/lib/createMetaTags";

export const Route = createFileRoute("/_layout/$slug")({
  loader: async ({ params }) => {
    const { allPosts } = await import("@/content-collections");
    const post = allPosts.find((post) => post._meta.path === params.slug);

    if (post) return { post };

    if (
      allPosts.some((post) => post._meta.path === `blog/${params.slug}`)
    ) {
      throw redirect({
        to: "/blog/$slug",
        params: { slug: params.slug },
        statusCode: 301,
      });
    }

    throw notFound();
  },
  head: ({ loaderData }) => ({
    links: loaderData
      ? [
          { rel: "stylesheet", href: codeSnippetsCssUrl },
          {
            rel: "canonical",
            href: `${currentBaseUrl}/${loaderData.post._meta.path}`,
          },
        ]
      : [],
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
          <h1 className="my-4 inline-block font-display text-4xl leading-tight lg:text-5xl">
            {post.title}
          </h1>
        </div>
        <Mdx code={post.mdx} />
      </article>
    </ContentPageWrapper>
  );
}
