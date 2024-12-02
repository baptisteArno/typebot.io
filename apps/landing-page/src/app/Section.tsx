import { cn } from "@/lib/utils";

export const Section = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <section
      className={cn("flex flex-col px-4 py-20 gap-20", className)}
      style={style}
    >
      {children}
    </section>
  );
};
