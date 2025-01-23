import { cn } from "@/lib/utils";

interface MarqueeProps {
  children?: React.ReactNode;
}

export function Marquee({ children }: MarqueeProps) {
  return (
    <div className="flex items-center overflow-hidden">
      {Array(2)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-shrink-0 justify-center flex-row items-center gap-8 md:gap-16 mr-8 md:mr-0 animate-marquee md:animate-none",
              i === 1 && "hidden",
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
