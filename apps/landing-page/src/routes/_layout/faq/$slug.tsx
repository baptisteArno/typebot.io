import { createFileRoute, redirect } from "@tanstack/react-router";
import { cx } from "@typebot.io/ui/lib/cva";
import codeSnippetsCssUrl from "@/assets/code-snippet.css?url";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { TextLink } from "@/components/link";
import { Mdx } from "@/features/blog/components/mdx";
import { createMetaTags } from "@/lib/createMetaTags";

const extractDescription = (content: string) => {
  const plainText = content
    .replace(/^---[\s\S]*?---/, "")
    .replace(/[<>]/g, "")
    .replace(/[#*`_[\]]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plainText.slice(0, 160) + (plainText.length > 160 ? "..." : "");
};

export const Route = createFileRoute("/_layout/faq/$slug")({
  loader: async ({ params }) => {
    const { allFaqs } = await import("@/content-collections");
    const faq = allFaqs.find((faq) => faq._meta.path.endsWith(params.slug));

    if (!faq) {
      throw redirect({
        to: "/faq",
      });
    }

    return { faq };
  },
  head: ({ loaderData }) => ({
    links: [{ rel: "stylesheet", href: codeSnippetsCssUrl }],
    meta: loaderData
      ? [
          ...createMetaTags({
            title: loaderData.faq.question,
            description: extractDescription(loaderData.faq.content),
            imagePath: "/images/default-og.png",
            path: `/faq/${loaderData.faq._meta.path.split("/").at(-1)}`,
          }),
        ]
      : [],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { faq } = Route.useLoaderData();
  return (
    <ContentPageWrapper className="max-w-7xl">
      <div className="flex gap-4 justify-center items-start">
        <article
          className={cx(
            "prose prose-p:text-lg prose-strong:font-medium prose-video:rounded-xl prose-a:text-[currentColor] max-w-4xl bg-white p-12 rounded-xl border",
            "prose-figure:my-0 prose-img:rounded-xl prose-img:max-h-[60vh] prose-img:w-auto",
            "prose-code:bg-gray-4 prose-code:rounded-md prose-code:text-orange-10 prose-code:border prose-code:border-gray-6 prose-code:p-1 prose-code:py-0.5 prose-code:font-normal",
          )}
        >
          <div className="flex flex-col gap-4">
            <TextLink
              href="/faq"
              className="not-prose font-normal uppercase text-sm"
            >
              ← All questions
            </TextLink>
            <h1 className="inline-block font-heading text-4xl not-prose text-foreground my-4 font-bold lg:text-5xl">
              {faq.question}
            </h1>
          </div>
          <Mdx code={faq.mdx} />
        </article>
      </div>
    </ContentPageWrapper>
  );
}
