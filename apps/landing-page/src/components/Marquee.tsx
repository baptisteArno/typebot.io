import { HStack } from "@chakra-ui/react";

interface MarqueeProps {
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
}

export function Marquee({
  reverse,
  pauseOnHover = false,
  children,
  ...props
}: MarqueeProps) {
  return (
    <HStack {...props} overflow="hidden" p={2}>
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <HStack
            gap={12}
            key={i}
            flexShrink={0}
            className="marquee"
            mr={10}
            css={{
              "--duration": "30s",
              "--gap": "2rem",
            }}
          >
            {children}
          </HStack>
        ))}
    </HStack>
  );
}
