import { Card } from "@/components/Card";
import { TextLink } from "@/components/link";
import { cn } from "@typebot.io/ui/lib/cn";
import { cx } from "@typebot.io/ui/lib/cva";
import { AnimatePresence, motion } from "motion/react";
import { type SVGProps, useEffect, useRef, useState } from "react";
import { breakpoints } from "../../../constants";
import { useWindowSize } from "../hooks/useWindowSize";
import deployVideoSrc from "./assets/deploy.mp4";
import dragDropVideoSrc from "./assets/drag-drop.mp4";
import realTimeResultVideoSrc from "./assets/real-time-result.mp4";

const carouselItemClassName = "carousel-item";

const TopConnector = ({ className }: SVGProps<SVGSVGElement>) => (
  <svg
    width="110"
    height="220"
    viewBox="0 0 110 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("-ml-2", className)}
  >
    <path
      d="M109.53 214.53C109.823 214.237 109.823 213.763 109.53 213.47L104.757 208.697C104.464 208.404 103.99 208.404 103.697 208.697C103.404 208.99 103.404 209.464 103.697 209.757L107.939 214L103.697 218.243C103.404 218.536 103.404 219.01 103.697 219.303C103.99 219.596 104.464 219.596 104.757 219.303L109.53 214.53ZM0.5 1.75H31V0.25H0.5V1.75ZM35.25 6V209H36.75V6H35.25ZM41 214.75H109V213.25H41V214.75ZM35.25 209C35.25 212.176 37.8244 214.75 41 214.75V213.25C38.6528 213.25 36.75 211.347 36.75 209H35.25ZM31 1.75C33.3472 1.75 35.25 3.65279 35.25 6H36.75C36.75 2.82436 34.1756 0.25 31 0.25V1.75Z"
      fill="#FF5924"
    />
  </svg>
);

const MiddleConnector = ({ className }: SVGProps<SVGSVGElement>) => (
  <svg
    width="109"
    height="34"
    viewBox="0 0 109 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("-ml-2", className)}
  >
    <path
      d="M108.53 28.5303C108.823 28.2374 108.823 27.7626 108.53 27.4697L103.757 22.6967C103.464 22.4038 102.99 22.4038 102.697 22.6967C102.404 22.9896 102.404 23.4645 102.697 23.7574L106.939 28L102.697 32.2426C102.404 32.5355 102.404 33.0104 102.697 33.3033C102.99 33.5962 103.464 33.5962 103.757 33.3033L108.53 28.5303ZM0 1.75H30V0.25H0V1.75ZM34.25 6V23H35.75V6H34.25ZM40 28.75H108V27.25H40V28.75ZM34.25 23C34.25 26.1756 36.8244 28.75 40 28.75V27.25C37.6528 27.25 35.75 25.3472 35.75 23H34.25ZM30 1.75C32.3472 1.75 34.25 3.65279 34.25 6H35.75C35.75 2.82436 33.1756 0.25 30 0.25V1.75Z"
      fill="#FF5924"
    />
  </svg>
);

const BottomConnector = ({ className }: SVGProps<SVGSVGElement>) => (
  <svg
    width="109"
    height="165"
    viewBox="0 0 109 165"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("-ml-2", className)}
  >
    <path
      d="M108.53 6.53033C108.823 6.23744 108.823 5.76256 108.53 5.46967L103.757 0.696699C103.464 0.403806 102.99 0.403806 102.697 0.696699C102.404 0.989593 102.404 1.46447 102.697 1.75736L106.939 6L102.697 10.2426C102.404 10.5355 102.404 11.0104 102.697 11.3033C102.99 11.5962 103.464 11.5962 103.757 11.3033L108.53 6.53033ZM0 164.75H30V163.25H0V164.75ZM35.75 159V11H34.25V159H35.75ZM40 6.75H108V5.25H40V6.75ZM35.75 11C35.75 8.65279 37.6528 6.75 40 6.75V5.25C36.8244 5.25 34.25 7.82437 34.25 11H35.75ZM30 164.75C33.1756 164.75 35.75 162.176 35.75 159H34.25C34.25 161.347 32.3472 163.25 30 163.25V164.75Z"
      fill="#FF5924"
    />
  </svg>
);

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
      src: dragDropVideoSrc,
    },
    Connector: TopConnector,
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
      src: deployVideoSrc,
    },
    Connector: MiddleConnector,
  },
  {
    title: {
      main: "More than just a bot",
      sub: "analyze your performance and grow",
    },
    description:
      "Collect real-time results and leverage Typebot's powerful analytics to fuel growth. Access detailed metrics like drop-off and completion rates, and easily export your data to CSV for deeper analysis. Effortlessly gather key insights to enhance your customers' chat experience and optimize your strategy.",
    video: {
      src: realTimeResultVideoSrc,
    },
    link: undefined,
    Connector: BottomConnector,
  },
] as const;

export const MainFeatures = () => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const isMobile = width && width < breakpoints.md;

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
    if (isMobile) return;
    setCurrentFeatureIndex(index);
  };

  return (
    <div className="w-full gap-2 flex flex-col md:flex-row md:items-start justify-center max-w-7xl md:gap-[110px]">
      <div
        ref={carouselRef}
        className="flex md:flex-col gap-2 items-end overflow-x-auto md:overflow-visible snap-x scroll-px-4 snap-always no-scrollbar px-4 snap-mandatory md:max-w-xl md:px-0"
      >
        {features.map((feature, index) => (
          <div
            key={feature.title.main}
            className="min-w-[calc(100%-.75rem)] md:min-w-0 flex relative isolate items-center snap-start cursor-pointer"
          >
            <FeatureCard
              className={cx(carouselItemClassName)}
              feature={feature}
              isExpanded={isMobile || feature.title === currentFeature.title}
              onClick={() => expandCardIfDesktop(index)}
            />
            <div
              className={cn(
                "flex absolute -right-[110px]",
                feature.title === currentFeature.title
                  ? "motion-opacity-in-0 motion-delay-100"
                  : "opacity-0",
                index === features.length - 1 && "items-end",
              )}
            >
              <div
                className={cn(
                  "size-4 bg-gray-4 border-white border rounded-full items-center justify-center flex",
                  index === features.length - 1 ? "-mb-[7px]" : "-mt-[7px]",
                )}
              >
                <div className="size-2 border-2 border-orange-9 rounded-full " />
              </div>
              <feature.Connector className="hidden md:flex -z-10" />
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 md:px-0">
        <AnimatePresence mode="popLayout">
          <motion.video
            key={currentFeature.video.src}
            src={currentFeature.video.src}
            width="476px"
            height="476px"
            className="rounded-2xl border-8 border-gray-12"
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
  feature: (typeof features)[number];
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
        className={cx(
          "flex flex-col gap-4 overflow-hidden",
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
