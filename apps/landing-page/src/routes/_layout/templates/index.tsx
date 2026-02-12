import { createFileRoute } from "@tanstack/react-router";
import { templates } from "@typebot.io/templates";
import { useState } from "react";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { currentBaseUrl } from "@/constants";
import { TemplatesFilterSidebar } from "@/features/templates/TemplatesFilterSidebar";
import { TemplatesGrid } from "@/features/templates/TemplatesGrid";
import { TemplatesHero } from "@/features/templates/TemplatesHero";
import { TemplatesSearchBar } from "@/features/templates/TemplatesSearchBar";
import { createMetaTags } from "@/lib/createMetaTags";

export const Route = createFileRoute("/_layout/templates/")({
  head: () => ({
    meta: createMetaTags({
      title: "Chatbot Templates | Typebot",
      description:
        "Browse ready-to-use chatbot templates for lead gen, support, surveys, and e-commerce. Start fast and customize.",
      imagePath: "/images/default-og.png",
      path: "/templates",
    }),
    links: [{ rel: "canonical", href: `${currentBaseUrl}/templates` }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const handleFilterChange = (category: string, option: string) => {
    setSelectedFilters((prev) => {
      const currentOptions = prev[category] ?? [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter((o) => o !== option)
        : [...currentOptions, option];
      return { ...prev, [category]: newOptions };
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedFilters({});
  };

  const filteredTemplates = templates.filter((template) => {
    const query = searchQuery.toLowerCase();
    const templateTitle = getTemplateTitle(template);
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(query) ||
      templateTitle.toLowerCase().includes(query) ||
      template.summary.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.highlights.some(
        (highlight) =>
          highlight.title.toLowerCase().includes(query) ||
          highlight.description.toLowerCase().includes(query),
      ) ||
      template.bestFor.some((item) => item.toLowerCase().includes(query)) ||
      (template.collects?.some((item) => item.toLowerCase().includes(query)) ??
        false) ||
      template.useCase.toLowerCase().includes(query) ||
      template.features.some((feature) =>
        feature.toLowerCase().includes(query),
      );

    const matchesUseCase =
      !selectedFilters["Use Case"]?.length ||
      selectedFilters["Use Case"].includes(template.useCase);

    const matchesFeatures =
      !selectedFilters.Features?.length ||
      template.features.some((feature) =>
        selectedFilters.Features?.includes(feature),
      );

    return matchesSearch && matchesUseCase && matchesFeatures;
  });

  return (
    <ContentPageWrapper>
      <div className="flex flex-col w-full gap-8">
        <TemplatesHero />
        <div className="flex gap-8 w-full">
          <TemplatesFilterSidebar
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <TemplatesFilterSidebar
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                mobile
              />
              <TemplatesSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
            <TemplatesGrid
              templates={filteredTemplates}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
      </div>
    </ContentPageWrapper>
  );
}

const getTemplateTitle = (template: (typeof templates)[number]) =>
  `${template.name} Chatbot Template`;
