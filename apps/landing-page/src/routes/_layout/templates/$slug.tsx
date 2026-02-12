import { createFileRoute, redirect } from "@tanstack/react-router";
import type { Template } from "@typebot.io/templates";
import { templates } from "@typebot.io/templates";
import { Badge } from "@typebot.io/ui/components/Badge";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { ButtonLink, CtaButtonLink } from "@/components/link";
import { dashboardUrl } from "@/constants";
import { TemplateCard } from "@/features/templates/TemplateCard";
import { createMetaTags } from "@/lib/createMetaTags";

export const Route = createFileRoute("/_layout/templates/$slug")({
  loader: async ({ params }) => {
    const template = templates.find((t) => t.slug === params.slug);

    if (!template) {
      throw redirect({
        to: "/templates",
      });
    }

    const relatedTemplates = templates
      .filter((t) => t.useCase === template.useCase && t.id !== template.id)
      .slice(0, 3);

    return { template, relatedTemplates };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? createMetaTags({
          title: `${getTemplateTitle(loaderData.template)} | Typebot`,
          description: loaderData.template.summary,
          imagePath: "/images/default-og.png",
          path: `/templates/${loaderData.template.slug}`,
        })
      : [],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { template, relatedTemplates } = Route.useLoaderData();
  const slug = template.slug;
  const templateTitle = getTemplateTitle(template);

  return (
    <ContentPageWrapper className="md:pt-12">
      <div className="flex flex-col gap-12 max-w-5xl mx-auto w-full">
        <ButtonLink
          to="/templates"
          variant="outline"
          className="self-start bg-background"
        >
          ← All templates
        </ButtonLink>

        <div className="flex flex-col gap-6 bg-background p-6 rounded-xl border">
          <div className="flex items-start gap-4">
            <span className="text-5xl md:text-6xl">{template.emoji}</span>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-bold text-balance leading-tight">
                {templateTitle}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>By</span>
                <span className="font-medium text-foreground">Typebot</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge colorScheme="purple">{template.useCase}</Badge>
            {template.features.map((feature) => (
              <Badge key={feature} colorScheme="blue">
                {feature}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-lg text-muted-foreground text-pretty">
              {template.summary}
            </p>
            <p className="text-base text-muted-foreground text-pretty">
              {template.description}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Best for</h2>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground list-disc list-inside">
                {template.bestFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {template.collects && (
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold">Data you collect</h2>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground list-disc list-inside">
                  {template.collects.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Key takeaways</h2>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground list-disc list-inside">
              {template.highlights.map((highlight) => (
                <li key={highlight.title}>
                  <strong className="text-foreground">
                    {highlight.title}:
                  </strong>{" "}
                  {highlight.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <CtaButtonLink
              href={`${dashboardUrl}?template=${slug}`}
              target="_blank"
            >
              Use this template
            </CtaButtonLink>
          </div>
        </div>

        {relatedTemplates.length > 0 && (
          <div className="flex flex-col gap-6 pt-8 border-t">
            <h2 className="text-2xl font-bold text-balance">
              More {template.useCase} templates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTemplates.map((related) => (
                <TemplateCard key={related.id} template={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ContentPageWrapper>
  );
}

const getTemplateTitle = (template: Template) =>
  `${template.name} Chatbot Template`;
