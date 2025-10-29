import { Field as PrimitiveField } from "@base-ui-components/react/field";
import { cn } from "../lib/cn";

const Root = ({ className, ...props }: PrimitiveField.Root.Props) => (
  <PrimitiveField.Root
    {...props}
    className={cn("flex flex-col gap-2", className)}
  />
);

export type LabelProps = PrimitiveField.Label.Props;
const Label = ({ className, ...props }: LabelProps) => (
  <PrimitiveField.Label
    {...props}
    className={cn("inline-flex items-center shrink-0 gap-1", className)}
  />
);

const Description = ({ ...props }: PrimitiveField.Description.Props) => (
  <PrimitiveField.Description {...props} />
);

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn("border px-4 py-3 rounded-md gap-4 flex flex-col", className)}
  >
    {children}
  </div>
);

export type ChangeEventDetails = PrimitiveField.Control.ChangeEventDetails;

export const Field = {
  Root,
  Label,
  Description,
  Container,
  Control: PrimitiveField.Control,
};
