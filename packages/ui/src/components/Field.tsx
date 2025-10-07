import { Field as PrimitiveField } from "@base-ui-components/react/field";
import { cn } from "../lib/cn";

const Root = ({ className, ...props }: PrimitiveField.Root.Props) => (
  <PrimitiveField.Root
    {...props}
    className={cn("flex flex-col gap-2", className)}
  />
);

const Label = ({ ...props }: PrimitiveField.Label.Props) => (
  <PrimitiveField.Label {...props} className="inline-flex items-center" />
);

const Description = ({ ...props }: PrimitiveField.Description.Props) => (
  <PrimitiveField.Description {...props} />
);

export const Field = {
  Root,
  Label,
  Description,
};
