import { Progress } from "@/components/Progress";
import { TypebotLogoFull } from "@/components/TypebotLogo";
import { CtaButtonLink } from "@/components/link";
import { enterpriseLeadTypebotUrl, registerUrl } from "@/constants";
import { cn } from "@typebot.io/ui/lib/cn";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import marketingBotSrc from "./assets/marketing-bot.png";
import marketingBuilderSrc from "./assets/marketing-builder.png";
import salesBotSrc from "./assets/sales-bot.png";
import salesBuilderSrc from "./assets/sales-builder.png";
import supportAndProductBotSrc from "./assets/support-bot.png";
import supportAndProductBuilderSrc from "./assets/support-builder.png";

const useCases = [
  {
    label: "Marketing",
    images: {
      builder: {
        src: marketingBuilderSrc,
        alt: "An example of a marketing bot being built in Typebot",
      },
      bot: {
        src: marketingBotSrc,
        alt: "A WhatsApp screenshot of a marketing bot",
      },
    },
  },
  {
    label: "Support & Product",
    images: {
      builder: {
        src: supportAndProductBuilderSrc,
        alt: "An example of a support bot being built in Typebot",
      },
      bot: {
        src: supportAndProductBotSrc,
        alt: "A web widget screenshot of a support bot",
      },
    },
  },
  {
    label: "Sales",
    images: {
      builder: {
        src: salesBuilderSrc,
        alt: "An example of a sales bot being built in Typebot",
      },
      bot: {
        src: salesBotSrc,
        alt: "A WhatsApp screenshot of a automated sales bot",
      },
    },
  },
] as const;

let interval: NodeJS.Timer;

export const UseCases = ({ className }: { className?: string }) => {
  const [isAutoProgressEnabled, setIsAutoProgressEnabled] = useState(true);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [currentUseCase, setCurrentUseCase] = useState<{
    index: number;
    value: number;
  }>({
    index: 0,
    value: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef);

  useEffect(() => {
    if (interval || !isInView) return;
    interval = setInterval(() => {
      setPreviousIndex(currentUseCase.index);
      setCurrentUseCase((prev) => {
        if (prev.value < 100) {
          return { ...prev, value: prev.value + 1 };
        } else {
          return {
            index: prev.index === useCases.length - 1 ? 0 : prev.index + 1,
            value: 0,
          };
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isInView]);

  const selectUseCase = (index: number) => {
    setPreviousIndex(currentUseCase.index);
    setCurrentUseCase({ index, value: 0 });
    setIsAutoProgressEnabled(false);
    clearInterval(interval);
  };

  const getProgressValue = (index: number) => {
    if (isAutoProgressEnabled) {
      if (currentUseCase.index === index) return currentUseCase.value;
      return;
    }
    if (currentUseCase.index === index) return 100;
    return;
  };

  return (
    <div
      className={cn("flex flex-col gap-16 md:gap-20 px-4 md:pt-10", className)}
      ref={containerRef}
    >
      <div className="flex flex-col items-center gap-20">
        <TypebotLogoFull width="120px" />
        <Cta />
      </div>
      <div className="flex flex-col items-center gap-4 md:12">
        <div className="flex items-end gap-4 md:gap-12">
          {useCases.map((useCase, index) => (
            <UsecaseTitle
              progressValue={getProgressValue(index)}
              onClick={() => selectUseCase(index)}
              key={useCase.label}
            >
              {useCase.label}
            </UsecaseTitle>
          ))}
        </div>
        <div className="relative isolate">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={cn(
                currentUseCase.index === index
                  ? previousIndex > index
                    ? "motion-opacity-in-0 -motion-translate-x-in-[20px]"
                    : "motion-opacity-in-0 motion-translate-x-in-[20px]"
                  : "absolute pointer-events-none opacity-0",
              )}
            >
              <figure className="border-2 border-gray-8 rounded-lg md:rounded-2xl overflow-hidden outline-4 md:outline-8 outline-gray-12 -outline-offset-[5px] md:-outline-offset-[10px] outline md:mr-24">
                <img
                  src={useCase.images.builder.src}
                  alt={useCase.images.builder.alt}
                  className="w-auto md:max-h-[85vh]"
                  width="3456px"
                  height="2158px"
                />
              </figure>
              <figure className="border-[0.5px] md:border-2 border-gray-8 rounded-xl md:rounded-[2rem] overflow-hidden outline-2 md:outline-8 outline-gray-12 -outline-offset-[2.5px] md:-outline-offset-[10px] outline absolute right-0 -bottom-4 md:-bottom-10">
                <img
                  src={useCase.images.bot.src}
                  alt={useCase.images.bot.alt}
                  className="w-auto max-h-none max-w-20 md:max-w-64 2xl:max-w-none 2xl:max-h-[65vh] p-[2px] md:p-2"
                  width="1179px"
                  height="2556px"
                />
              </figure>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UsecaseTitle = ({
  children,
  progressValue,
  onClick,
}: {
  children: React.ReactNode;
  progressValue?: number;
  onClick?: () => void;
}) => (
  <button
    className="flex flex-col items-center gap-2 flex-shrink-0"
    onClick={onClick}
  >
    <h3
      className="text-lg font-medium transition-opacity duration-200 ease-out text-center"
      style={{ opacity: progressValue ? 1 : 0.5 }}
    >
      {children}
    </h3>
    <Progress value={progressValue ?? 0} className="w-12 rounded-full" />
  </button>
);

export const Cta = () => (
  <div className="flex flex-col gap-6 items-center">
    <p className="text-gray-11 text-balance max-w-4xl md:text-center text-lg">
      Picture{" "}
      <span className="font-medium">
        a bot that goes beyond answering questions
      </span>
      : it builds relationships, shares content, sparks conversations, and
      reflects your business's personality and values. With over 3 billion
      people on messaging apps,{" "}
      <span className="font-medium">
        it's time to connect with your customers where they are
      </span>
      .
    </p>
    <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
      <CtaButtonLink size="lg" href={registerUrl}>
        Get started free
      </CtaButtonLink>
    </div>
  </div>
);
