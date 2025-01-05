interface MarqueeProps {
  children?: React.ReactNode;
}

export function Marquee({ children }: MarqueeProps) {
  return (
    <div className="flex items-center overflow-hidden">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex flex-shrink-0 flex-row items-center gap-8 mr-8 animate-marquee"
          >
            {children}
          </div>
        ))}
    </div>
  );
}
