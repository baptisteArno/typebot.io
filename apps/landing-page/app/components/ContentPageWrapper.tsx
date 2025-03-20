import { cn } from "@typebot.io/ui/lib/cn";

export const ContentPageWrapper = ({
  children,
  className,
}: { children: React.ReactNode; className?: string }) => {
  return (
    <section
      className={cn(
        "flex flex-col max-w-7xl mx-auto gap-12 pt-32 md:pt-20 w-full pb-20 md:pb-32 px-4",
        className,
      )}
    >
      {children}
    </section>
  );
};
