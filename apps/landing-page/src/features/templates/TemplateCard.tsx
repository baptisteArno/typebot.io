import { Link } from "@tanstack/react-router";
import { Card } from "@/components/Card";
import type { Template } from "./templatesData";

type Props = {
  template: Template;
};

export const TemplateCard = ({ template }: Props) => {
  const slug = template.fileName.replace(".json", "");

  return (
    <Link to="/templates/$slug" params={{ slug }}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-4xl">
          {template.emoji}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">{template.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        </div>
        <div className="flex gap-2 mt-auto flex-wrap">
          <span className="text-xs px-2 py-1 bg-muted rounded-md">
            {template.useCase}
          </span>
          {template.features.map((feature) => (
            <span
              key={feature}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md"
            >
              {feature}
            </span>
          ))}
        </div>
      </Card>
    </Link>
  );
};
