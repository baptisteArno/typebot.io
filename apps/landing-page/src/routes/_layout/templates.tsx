import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { TemplatesFilterSidebar } from "@/features/templates/TemplatesFilterSidebar";
import { TemplatesGrid } from "@/features/templates/TemplatesGrid";
import { TemplatesHero } from "@/features/templates/TemplatesHero";
import { TemplatesSearchBar } from "@/features/templates/TemplatesSearchBar";
import { templates } from "@/features/templates/templatesData";
import { createMetaTags } from "@/lib/createMetaTags";

export const Route = createFileRoute("/_layout/templates")({
  head: () => ({
    meta: createMetaTags({
      title: "Templates | Typebot",
      description:
        "Explore our collection of ready-to-use chatbot templates. Find the perfect starting point for your next project.",
      imagePath: "/images/default-og.png",
      path: "/templates",
    }),
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

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedFilters.Category?.length ||
      selectedFilters.Category.includes(template.category);

    const matchesComplexity =
      !selectedFilters.Complexity?.length ||
      selectedFilters.Complexity.includes(template.complexity);

    return matchesSearch && matchesCategory && matchesComplexity;
  });

  return (
    <ContentPageWrapper>
      <div className="flex flex-col items-center w-full gap-8">
        <TemplatesHero />
        <TemplatesSearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="flex gap-8 w-full">
          <TemplatesFilterSidebar
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />
          <TemplatesGrid templates={filteredTemplates} />
        </div>
      </div>
    </ContentPageWrapper>
  );
}
