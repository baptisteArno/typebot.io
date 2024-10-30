"use client";
import {
  AspectRatio,
  Box,
  Card,
  type CardRootProps,
  HStack,
  Heading,
  Link,
  Span,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ArrowUpRightIcon } from "@typebot.io/ui/icons/ArrowUpRightIcon";
import { AnimatePresence, type PanInfo, motion } from "framer-motion";
import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FeatureCardData } from "./types";

const swipeDistance = 50;
const carouselItemClassName = "carousel-item";

const features = [
  {
    title: {
      main: "From block to bot",
      sub: "create your custom chat experience",
    },
    description:
      "Typebot's chat builder makes it easy to create advanced chat experiences with 45+ building blocks. Add text, images, videos, and use diverse input options such as text fields, buttons, date pickers, and payment inputs. Connect effortlessly with tools like OpenAI, Google Sheets, Zapier and customize every detail, from fonts and colors to shapes and shadows, with advanced theming and reusable templates.",
    link: {
      src: "https://docs.typebot.io/editor/blocks/integrations/google-sheets",
      text: "View all integrations",
    },
    video: {
      src: "/videos/drag-drop.mp4",
    },
  },
  {
    title: {
      main: "One fits all",
      sub: "deploy your bot seamlessly within your ecosystem",
    },
    description:
      "Typebot is the leading multichannel chat builder, allowing you to build your bot once and deploy it anywhere, via custom domains, embedded containers, popups, chat bubbles, or even on WhatsApp. You can also execute your bot using HTTP requests, making it easy to integrate with other services or use it in different programming languages.",
    link: {
      src: "https://docs.typebot.io/deploy/web/overview",
      text: "Read docs",
    },
    video: {
      src: "/videos/deploy.mp4",
    },
  },
  {
    title: {
      main: "More than just a bot",
      sub: "analyze your performance and grow",
    },
    description:
      "Collect real-time results and leverage Typebot's powerful analytics to fuel growth. Access detailed metrics like drop-off and completion rates, and easily export your data to CSV for deeper analysis. Effortlessly gather key insights to enhance your customers' chat experience and optimize your strategy.",
    video: {
      src: "videos/real-time-result.mp4",
    },
  },
] as const satisfies FeatureCardData[];

export const MainFeatures = () => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const currentFeature = features[currentFeatureIndex];

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const items = container.getElementsByClassName(carouselItemClassName);

    const handleScroll = () => {
      let currentIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      [...items].forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const distance = Math.abs(rect.left - containerRect.left);

        if (distance < minDistance) {
          minDistance = distance;
          currentIndex = index;
        }
      });

      setCurrentFeatureIndex(currentIndex);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Stack w="full" pb="20">
      <Box
        ref={carouselRef}
        display="flex"
        gap="2"
        alignItems="flex-end"
        overflow="auto"
        scrollSnapType="x mandatory"
        scrollPadding="0 1rem"
        scrollSnapStop="always"
        className="hide-scrollbar"
        px="4"
      >
        {features.map((feature) => (
          <FeatureCard
            className={carouselItemClassName}
            key={feature.title.main}
            feature={feature}
            minW="full"
            scrollSnapAlign="start"
          />
        ))}
      </Box>
      <AspectRatio maxW="100%" ratio={1} mx="4">
        <Box bgColor="gray.950" rounded="2xl" p="2">
          <AnimatePresence mode="popLayout">
            <motion.video
              key={currentFeature.video.src}
              src={currentFeature.video.src}
              autoPlay
              muted
              loop
              playsInline
              style={{ borderRadius: "0.5rem" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </AnimatePresence>
        </Box>
      </AspectRatio>
    </Stack>
  );
};

const FeatureCard = ({
  feature,
  ...props
}: {
  feature: FeatureCardData;
} & CardRootProps) => {
  return (
    <Card.Root {...props} borderRadius="2xl">
      <Card.Header>
        <Heading>
          <Span fontWeight="bold">{feature.title.main}</Span>:{" "}
          {feature.title.sub}
        </Heading>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <Text>{feature.description}</Text>
          {feature.link && (
            <Link asChild fontWeight="medium" textDecor="underline">
              <NextLink href={feature.link.src} target="_blank">
                <HStack gap={1}>
                  <Text>{feature.link.text}</Text>
                  <ArrowUpRightIcon fontSize="lg" mt="0.5" />
                </HStack>
              </NextLink>
            </Link>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};
