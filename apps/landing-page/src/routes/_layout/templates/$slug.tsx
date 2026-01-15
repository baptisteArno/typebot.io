import { createFileRoute, redirect } from "@tanstack/react-router";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { TextLink } from "@/components/link";
import { templates } from "@/features/templates/templatesData";
import { createMetaTags } from "@/lib/createMetaTags";

export const Route = createFileRoute("/_layout/templates/$slug")({
  loader: async ({ params }) => {
    const template = templates.find(
      (t) => t.fileName.replace(".json", "") === params.slug,
    );

    if (!template) {
      throw redirect({
        to: "/templates",
      });
    }

    return { template };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? createMetaTags({
          title: `${loaderData.template.name} Template | Typebot`,
          description: loaderData.template.description,
          imagePath: "/images/default-og.png",
          path: `/templates/${loaderData.template.fileName.replace(".json", "")}`,
        })
      : [],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { template } = Route.useLoaderData();

  return (
    <ContentPageWrapper>
      <div className="flex flex-col gap-8 max-w-4xl mx-auto">
        <TextLink href="/templates" className="font-normal uppercase text-sm">
          ← All templates
        </TextLink>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{template.emoji}</span>
            <h1 className="text-4xl font-bold">{template.name}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {template.description}
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm px-3 py-1 bg-muted rounded-md">
              {template.useCase}
            </span>
            {template.features.map((feature) => (
              <span
                key={feature}
                className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-md"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ContentPageWrapper>
  );
}
