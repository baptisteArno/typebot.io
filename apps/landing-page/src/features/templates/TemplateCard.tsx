import { Link } from "@tanstack/react-router";
import type { Template } from "@typebot.io/templates";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Card } from "@/components/Card";

type Props = {
  template: Template;
};

export const TemplateCard = ({ template }: Props) => {
  const slug = template.slug;
  const title = `${template.name} Chatbot Template`;

  return (
    <Link to="/templates/$slug" params={{ slug }}>
      <Card className="group hover:bg-muted/50 transition-colors cursor-pointer h-full">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{template.emoji}</span>
          <h3 className="font-semibold text-balance leading-tight">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground text-pretty line-clamp-2">
          {template.summary}
        </p>
        <div className="flex gap-1.5 mt-auto flex-wrap">
          <Badge colorScheme="purple">{template.useCase}</Badge>
          {template.features.map((feature) => (
            <Badge key={feature} colorScheme="blue">
              {feature}
            </Badge>
          ))}
        </div>
      </Card>
    </Link>
  );
};
