import { cn } from "@typebot.io/ui/lib/cn";

interface MarqueeProps {
  children?: React.ReactNode;
}

export function Marquee({ children }: MarqueeProps) {
  return (
    <div
      className="flex items-center overflow-hidden select-none gap-[--marquee-gap]"
      style={
        {
          "--marquee-gap": "2rem",
        } as React.CSSProperties
      }
    >
      {Array(2)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i === 1 ? "true" : undefined}
            className={cn(
              "flex flex-shrink-0 justify-around min-w-full flex-row items-center gap-[--marquee-gap] md:gap-16 animate-marquee md:animate-none",
              i === 1 ? "md:hidden" : undefined,
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
