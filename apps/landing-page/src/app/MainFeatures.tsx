"use client";

import { Card } from "@/components/card";
import { TextLink } from "@/components/text-link";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { type SVGProps, useEffect, useRef, useState } from "react";
import { useWindowSize } from "react-use";
import { breakpoints } from "./constants";
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
  const { width } = useWindowSize();
  const isMobile = width < breakpoints.md;

  const currentFeature = features[currentFeatureIndex];

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const items = container.getElementsByClassName(carouselItemClassName);

    const handleScroll = () => {
      if (!isMobile) return;
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
  }, [isMobile]);

  const expandCardIfDesktop = (index: number) => {
    console.log(index);
    if (isMobile) return;
    setCurrentFeatureIndex(index);
  };

  return (
    <div className="w-full gap-2 flex flex-col md:flex-row md:items-start max-w-7xl md:gap-0">
      <div
        ref={carouselRef}
        className="flex md:flex-col gap-2 items-end overflow-x-auto md:overflow-hidden snap-x scroll-px-4 snap-always no-scrollbar px-4 snap-mandatory md:max-w-xl md:px-0"
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title.main}
            className={clsx(
              carouselItemClassName,
              "min-w-[calc(100%-.75rem)] snap-start cursor-pointer",
            )}
            feature={feature}
            isExpanded={isMobile || feature.title === currentFeature.title}
            onClick={() => expandCardIfDesktop(index)}
          />
        ))}
      </div>
      <Connector className="hidden md:block" />
      <div className="bg-gray-12 rounded-2xl p-2 mx-4 md:mx-0 max-w-full aspect-square">
        <AnimatePresence mode="popLayout">
          <motion.video
            key={currentFeature.video.src}
            src={currentFeature.video.src}
            width="476px"
            height="476px"
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
  isExpanded,
  feature,
  className,
  onClick,
}: {
  isExpanded?: boolean;
  feature: FeatureCardData;
  className?: string;
  onClick: () => void;
}) => {
  return (
    <Card className={className} onClick={onClick}>
      <h2 className="text-2xl">
        <span className="font-bold">{feature.title.main}</span>:{" "}
        {feature.title.sub}
      </h2>
      <motion.div
        className={clsx(
          "flex flex-col gap-4",
          isExpanded ? "pointer-events-auto" : "pointer-events-none",
        )}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
        suppressHydrationWarning
      >
        <p>{feature.description}</p>
        {feature.link && (
          <TextLink href={feature.link.src} target="_blank">
            {feature.link.text}
          </TextLink>
        )}
      </motion.div>
    </Card>
  );
};

const Connector = ({ className }: SVGProps<SVGSVGElement>) => (
  <svg
    width="119"
    height="266"
    viewBox="0 0 119 266"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("-ml-2", className)}
  >
    <path
      d="M118.53 260.53C118.823 260.237 118.823 259.763 118.53 259.47L113.757 254.697C113.464 254.404 112.99 254.404 112.697 254.697C112.404 254.99 112.404 255.464 112.697 255.757L116.939 260L112.697 264.243C112.404 264.536 112.404 265.01 112.697 265.303C112.99 265.596 113.464 265.596 113.757 265.303L118.53 260.53ZM9.5 14.75H40V13.25H9.5V14.75ZM44.25 19V255H45.75V19H44.25ZM50 260.75H118V259.25H50V260.75ZM44.25 255C44.25 258.176 46.8244 260.75 50 260.75V259.25C47.6528 259.25 45.75 257.347 45.75 255H44.25ZM40 14.75C42.3472 14.75 44.25 16.6528 44.25 19H45.75C45.75 15.8244 43.1756 13.25 40 13.25V14.75Z"
      fill="#FF5924"
    />
    <g filter="url(#filter0_dd_589_8052)">
      <circle cx="16" cy="14" r="8" fill="#ECECEC" />
      <circle cx="16" cy="14" r="7.5" stroke="white" />
    </g>
    <g filter="url(#filter1_d_589_8052)">
      <circle
        cx="16.0026"
        cy="14.0002"
        r="3.66667"
        stroke="#FF5924"
        strokeWidth="2"
        shapeRendering="crispEdges"
      />
    </g>
    <defs>
      <filter
        id="filter0_dd_589_8052"
        x="0"
        y="0"
        width="32"
        height="32"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="1" />
        <feGaussianBlur stdDeviation="1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.0901961 0 0 0 0 0.0901961 0 0 0 0 0.0901961 0 0 0 0.08 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_589_8052"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="2" />
        <feGaussianBlur stdDeviation="4" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.0901961 0 0 0 0 0.0901961 0 0 0 0 0.0901961 0 0 0 0.12 0"
        />
        <feBlend
          mode="normal"
          in2="effect1_dropShadow_589_8052"
          result="effect2_dropShadow_589_8052"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow_589_8052"
          result="shape"
        />
      </filter>
      <filter
        id="filter1_d_589_8052"
        x="10.3359"
        y="9.3335"
        width="11.333"
        height="11.3335"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.0901961 0 0 0 0 0.0901961 0 0 0 0 0.0901961 0 0 0 0.12 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_589_8052"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_589_8052"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
