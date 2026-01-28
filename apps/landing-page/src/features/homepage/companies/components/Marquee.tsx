import { cn } from "@typebot.io/ui/lib/cn";

interface MarqueeProps {
  children?: React.ReactNode;
}

export function Marquee({ children }: MarqueeProps) {
  const copies = ["primary", "clone"];
  return (
    <div
      className="flex items-center overflow-hidden select-none gap-(--marquee-gap)"
      style={
        {
          "--marquee-gap": "2rem",
        } as React.CSSProperties
      }
    >
      {copies.map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === "clone" ? "true" : undefined}
          className={cn(
            "flex shrink-0 justify-around min-w-full flex-row items-center gap-(--marquee-gap) md:gap-16 animate-marquee md:animate-none",
            copy === "clone" ? "md:hidden" : undefined,
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
