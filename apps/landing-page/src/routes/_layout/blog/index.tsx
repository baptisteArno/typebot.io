import { createFileRoute, Link } from "@tanstack/react-router";
import { isDefined } from "@typebot.io/lib/utils";
import { Card } from "@/components/Card";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { allPosts } from "@/content-collections";
import { formatDate } from "@/features/blog/helpers";
import { createMetaTags } from "@/lib/createMetaTags";

export const Route = createFileRoute("/_layout/blog/")({
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
        {allPosts
          .filter((post) => isDefined(post.postedAt))
          .sort(
            (a, b) =>
              new Date(b.postedAt!).getTime() - new Date(a.postedAt!).getTime(),
          )
          .map((post) => (
            <li key={post._meta.path}>
              <Link to={"/" + post._meta.path}>
                <Card>
                  <time className="text-gray-10">
                    {formatDate(post.postedAt!)}
                  </time>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <p className="font-medium underline">Read more</p>
                </Card>
              </Link>
            </li>
          ))}
      </ol>
    </ContentPageWrapper>
  );
}
