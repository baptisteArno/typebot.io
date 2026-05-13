import { createFileRoute, Link } from "@tanstack/react-router";
import { isDefined } from "@typebot.io/lib/utils";
import { Card } from "@/components/Card";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { createMetaTags } from "@/lib/createMetaTags";

const extractExcerpt = (content: string) => {
  const plainText = content
    .replace(/^---[\s\S]*?---/, "")
    .replace(/[<>]/g, "")
    .replace(/[#*`_[\]]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plainText.slice(0, 120) + (plainText.length > 120 ? "..." : "");
};

export const Route = createFileRoute("/_layout/faq/")({
  loader: async () => {
    const { allFaqs } = await import("@/content-collections");
    return {
      faqs: allFaqs
        .filter((faq) => isDefined(faq.postedAt))
        .sort(
          (a, b) =>
            new Date(b.postedAt!).getTime() - new Date(a.postedAt!).getTime(),
        ),
    };
  },
  head: () => ({
    meta: createMetaTags({
      title: "FAQ - Frequently Asked Questions | Typebot",
      description:
        "Find answers to the most common questions about chatbots, conversational AI, and Typebot.",
      imagePath: "/images/default-og.png",
      path: "/faq",
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { faqs } = Route.useLoaderData();
  return (
    <ContentPageWrapper className="max-w-3xl">
      <div className="flex flex-col gap-6">
        <h1>Frequently Asked Questions</h1>
        <p className="text-xl">
          Find answers to the most common questions about chatbots,
          conversational AI, and building with Typebot.
        </p>
      </div>
      <ol className="flex flex-col gap-6">
        {faqs.map((faq) => {
          const slug = faq._meta.path.split("/").at(-1) ?? faq._meta.path;

          return (
            <li key={faq._meta.path}>
              <Link to="/faq/$slug" params={{ slug }}>
                <Card>
                  <h3>{faq.question}</h3>
                  <p>{extractExcerpt(faq.content)}</p>
                  <p className="font-medium underline">Read answer</p>
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>
    </ContentPageWrapper>
  );
}
