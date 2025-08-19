import { Field as PrimitiveField } from "@base-ui-components/react/field";
import { cn } from "../lib/cn";

const Root = ({ className, ...props }: PrimitiveField.Root.Props) => (
  <PrimitiveField.Root
    {...props}
    className={cn("flex flex-col gap-1", className)}
  />
);

const Label = ({ ...props }: PrimitiveField.Label.Props) => (
  <PrimitiveField.Label {...props} />
);

const Description = ({ ...props }: PrimitiveField.Description.Props) => (
  <PrimitiveField.Description {...props} />
);

export const Field = {
  Root,
  Label,
  Description,
};
