import { Card } from "@/components/Card";
import { CommonPageLayout } from "@/components/CommonPageLayout";
import { formatDate } from "@/features/blog/helpers";
import { seo } from "@/lib/seo";
import { Link, createFileRoute } from "@tanstack/react-router";
import { allPosts } from "content-collections";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      ...seo({
        title: "Typebot Blog",
      }),
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <CommonPageLayout className="max-w-3xl">
      <div className="flex flex-col gap-6">
        <h1>Insights and resources on all things chatbot</h1>
        <p className="text-xl">
          Learn more about Typebot, chatbots, conversational AI and more to help
          you hack the bot game and grow your business.
        </p>
      </div>
      <ol className="flex flex-col gap-6">
        {allPosts
          .sort(
            (a, b) =>
              new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
          )
          .map((post) => (
            <li key={post._meta.path}>
              <Link to={`/blog/${post._meta.path}`}>
                <Card>
                  <time className="text-gray-10">
                    {formatDate(post.postedAt)}
                  </time>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <p className="font-medium underline">Read more</p>
                </Card>
              </Link>
            </li>
          ))}
      </ol>
    </CommonPageLayout>
  );
}
