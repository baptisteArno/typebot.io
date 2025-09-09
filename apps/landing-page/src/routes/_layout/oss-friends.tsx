import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ArrowUpRightIcon } from "@typebot.io/ui/icons/ArrowUpRightIcon";
import { z } from "@typebot.io/zod";
import { Card } from "@/components/Card";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { createMetaTags } from "@/lib/createMetaTags";

export const getAndParseOssFriends = createServerFn().handler(async () => {
  const res = await fetch("https://formbricks.com/api/oss-friends");
  const data = await res.json();
  return z
    .array(
      z.object({
        href: z.string(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .parse(data.data)
    .filter((friend) => friend.name !== "Typebot");
});

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
  loader: async () => await getAndParseOssFriends(),
});

function RouteComponent() {
  const ossFriends = Route.useLoaderData();
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
