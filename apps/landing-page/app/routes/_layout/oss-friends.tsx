import { Card } from "@/components/Card";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { createMetaTags } from "@/lib/createMetaTags";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRightIcon } from "@typebot.io/ui/icons/ArrowUpRightIcon";

export const Route = createFileRoute("/_layout/oss-friends")({
  head: () => ({
    meta: createMetaTags({
      title: "OSS Friends | Typebot",
      description:
        "We love open-source and we are proud to support these amazing projects.",
      imagePath: "/images/default-og.png",
      path: "/oss-friends",
    }),
  }),
  component: RouteComponent,
  loader: async () => {
    const res = await fetch("https://formbricks.com/api/oss-friends");
    const data = await res.json();

    return {
      ossFriends: (
        data.data as {
          href: string;
          name: string;
          description: string;
        }[]
      ).filter((friend) => friend.name !== "Typebot"),
    };
  },
});

function RouteComponent() {
  const { ossFriends } = Route.useLoaderData();
  return (
    <ContentPageWrapper>
      <div className="flex flex-col gap-4">
        <h1>Our Open-source Friends</h1>
        <p>
          We love open-source and we are proud to support these amazing
          projects.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ossFriends.map((friend) => (
          <Link
            key={friend.name}
            to={friend.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Card className="h-full relative">
              <h2 className="text-2xl">{friend.name}</h2>
              <p>{friend.description}</p>
              <ArrowUpRightIcon className="size-6 absolute top-4 right-4 text-gray-10" />
            </Card>
          </Link>
        ))}
      </div>
    </ContentPageWrapper>
  );
}
