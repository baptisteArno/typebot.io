"use client";
import { Card, CardContent, CardHeader } from "@/components/card";
import { ArrowUpRightIcon } from "@typebot.io/ui/icons/ArrowUpRightIcon";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FeatureCardData } from "./types";

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
    <div className="w-full pb-20 gap-2 flex flex-col">
      <div
        ref={carouselRef}
        className="flex gap-2 items-end overflow-x-auto snap-x scroll-px-4 snap-always no-scrollbar px-4 snap-mandatory"
      >
        {features.map((feature) => (
          <FeatureCard
            key={feature.title.main}
            className={clsx(carouselItemClassName, "min-w-full snap-start")}
            feature={feature}
          />
        ))}
      </div>
      <div className="bg-gray-12 rounded-2xl p-2 mx-4 max-w-full aspect-square">
        <AnimatePresence mode="popLayout">
          <motion.video
            key={currentFeature.video.src}
            src={currentFeature.video.src}
            className="rounded-lg"
            autoPlay
            muted
            loop
            playsInline
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

const FeatureCard = ({
  feature,
  className,
}: {
  feature: FeatureCardData;
  className?: string;
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <h2 className="text-2xl">
          <span className="font-bold">{feature.title.main}</span>:{" "}
          {feature.title.sub}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p>{feature.description}</p>
          {feature.link && (
            <NextLink
              href={feature.link.src}
              target="_blank"
              className="font-medium underline"
            >
              <div className="flex items-center gap-1">
                <span>{feature.link.text}</span>
                <ArrowUpRightIcon className="mt-0.5 text-lg w-6" />
              </div>
            </NextLink>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
