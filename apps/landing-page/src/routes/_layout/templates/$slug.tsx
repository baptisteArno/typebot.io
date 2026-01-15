import { createFileRoute, redirect } from "@tanstack/react-router";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { CtaButtonLink, TextLink } from "@/components/link";
import { dashboardUrl } from "@/constants";
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
      <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
        <TextLink href="/templates" className="font-normal uppercase text-sm">
          ← All templates
        </TextLink>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{template.emoji}</span>
              <h1 className="text-4xl font-bold">{template.name}</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {template.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>By</span>
              <span className="font-medium text-foreground">Typebot</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                Official
              </span>
            </div>
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
            <CtaButtonLink
              href={`${dashboardUrl}?template=${template.fileName.replace(".json", "")}`}
              target="_blank"
              className="w-fit mt-2"
            >
              Get template
            </CtaButtonLink>
          </div>
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
              <span className="text-8xl">{template.emoji}</span>
            </div>
          </div>
        </div>
      </div>
    </ContentPageWrapper>
  );
}
