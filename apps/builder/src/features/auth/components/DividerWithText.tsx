import { cn } from "@typebot.io/ui/lib/cn";

export const DividerWithText = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex-1">
        <div className="h-px bg-gray-5" />
      </div>
      <span className="px-3 text-gray-11">{children}</span>
      <div className="flex-1">
        <div className="h-px bg-gray-5" />
      </div>
    </div>
  );
};
