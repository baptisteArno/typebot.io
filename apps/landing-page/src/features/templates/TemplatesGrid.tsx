import { TemplateCard } from "./TemplateCard";
import type { Template } from "./templatesData";

type Props = {
  templates: Template[];
};

export const TemplatesGrid = ({ templates }: Props) => {
  if (templates.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">
          No templates found matching your criteria.
        </p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
};
