import { createFileRoute, Link } from "@tanstack/react-router";
import { isDefined } from "@typebot.io/lib/utils";
import { Card } from "@/components/Card";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { formatDate } from "@/features/blog/helpers";
import { createMetaTags } from "@/lib/createMetaTags";

export const Route = createFileRoute("/_layout/blog/")({
  loader: async () => {
    const { allPosts } = await import("@/content-collections");
    return {
      posts: allPosts
        .filter((post) => isDefined(post.postedAt))
        .sort(
          (a, b) =>
            new Date(b.postedAt!).getTime() - new Date(a.postedAt!).getTime(),
        ),
    };
  },
  head: () => ({
    meta: createMetaTags({
      title: "Typebot Blog",
      description:
        "Learn more about Typebot, chatbots, conversational AI and more to help you hack the bot game and grow your business.",
      imagePath: "/images/default-og.png",
      path: "/blog",
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { posts } = Route.useLoaderData();
  return (
    <ContentPageWrapper className="max-w-3xl">
      <div className="flex flex-col gap-6">
        <h1>Insights and resources on all things chatbot</h1>
        <p className="text-xl">
          Learn more about Typebot, chatbots, conversational AI and more to help
          you hack the bot game and grow your business.
        </p>
      </div>
      <ol className="flex flex-col gap-6">
        {posts.map((post) => {
          const slug = post._meta.path.split("/").at(-1) ?? post._meta.path;

          return (
            <li key={post._meta.path}>
              <Link to="/blog/$slug" params={{ slug }}>
                <Card>
                  <time className="text-foreground/50">
                    {formatDate(post.postedAt!)}
                  </time>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <p className="font-medium underline">Read more</p>
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>
    </ContentPageWrapper>
  );
}
