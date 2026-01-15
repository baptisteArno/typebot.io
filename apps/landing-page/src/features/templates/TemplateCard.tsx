import { Card } from "@/components/Card";
import type { Template } from "./templatesData";

type Props = {
  template: Template;
};

export const TemplateCard = ({ template }: Props) => {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-4xl">
        {template.emoji}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">{template.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </div>
      <div className="flex gap-2 mt-auto">
        <span className="text-xs px-2 py-1 bg-muted rounded-md">
          {template.category}
        </span>
        <span className="text-xs px-2 py-1 bg-muted rounded-md">
          {template.complexity}
        </span>
      </div>
    </Card>
  );
};
