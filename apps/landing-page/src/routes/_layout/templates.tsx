import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import type { Template } from "@/features/templates/TemplateCard";
import { TemplatesFilterSidebar } from "@/features/templates/TemplatesFilterSidebar";
import { TemplatesGrid } from "@/features/templates/TemplatesGrid";
import { TemplatesHero } from "@/features/templates/TemplatesHero";
import { TemplatesSearchBar } from "@/features/templates/TemplatesSearchBar";
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

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Lead Generation Bot",
    description:
      "Capture and qualify leads with this conversational form template.",
    category: "Marketing",
    complexity: "Simple",
  },
  {
    id: "2",
    name: "Customer Support FAQ",
    description:
      "Answer common questions automatically and route complex issues to your team.",
    category: "Support",
    complexity: "Intermediate",
  },
  {
    id: "3",
    name: "Product Recommendation",
    description:
      "Guide customers to the right product based on their needs and preferences.",
    category: "Sales",
    complexity: "Advanced",
  },
  {
    id: "4",
    name: "Employee Onboarding",
    description:
      "Streamline the onboarding process with interactive checklists and resources.",
    category: "HR",
    complexity: "Intermediate",
  },
  {
    id: "5",
    name: "Quiz Template",
    description:
      "Create engaging quizzes for education, marketing, or entertainment.",
    category: "Education",
    complexity: "Simple",
  },
  {
    id: "6",
    name: "Appointment Booking",
    description:
      "Let users book appointments directly through a conversational interface.",
    category: "Sales",
    complexity: "Intermediate",
  },
];

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

  const filteredTemplates = mockTemplates.filter((template) => {
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
