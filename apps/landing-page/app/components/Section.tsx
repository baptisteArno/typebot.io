import { cn } from "@typebot.io/ui/lib/cn";

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
      className={cn(
        "flex flex-col px-4 py-20 md:py-32 gap-24 md:gap-44 items-center",
        className,
      )}
      style={style}
    >
      {children}
    </section>
  );
};
