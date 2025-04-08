import { Card } from "@/components/Card";
import { ButtonLink } from "@/components/link";
import { registerUrl } from "@/constants";
import { BracesIcon } from "@typebot.io/ui/icons/BracesIcon";
import { DatabaseIcon } from "@typebot.io/ui/icons/DatabaseIcon";
import { FileCodeIcon } from "@typebot.io/ui/icons/FileCodeIcon";
import { LinkIcon } from "@typebot.io/ui/icons/LinkIcon";
import { UsersIcon } from "@typebot.io/ui/icons/UsersIcon";
import { ZapIcon } from "@typebot.io/ui/icons/ZapIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import bgImage0 from "./assets/0.png";
import bgImage1 from "./assets/1.png";
import bgImage2 from "./assets/2.png";
import bgImage3 from "./assets/3.png";
import bgImage4 from "./assets/4.png";
import bgImage5 from "./assets/5.png";

const bgImageSrcs = [
  bgImage0,
  bgImage1,
  bgImage2,
  bgImage3,
  bgImage4,
  bgImage5,
];

const cards = [
  {
    Icon: BracesIcon,
    title: "Hidden fields",
    description:
      "Include data in your form URL to segment your user and use its data directly in your form.",
    rotateCoeff: -10,
  },
  {
    Icon: UsersIcon,
    title: "Team collaboration",
    description:
      "Sharing is caring: invite your teammates to work on your typebots with you",
    rotateCoeff: 12,
  },
  {
    Icon: LinkIcon,
    title: "Link to sub typebots",
    description:
      "For the in-depth analytics lovers who want to see flow with drop-off rate etc.",
    rotateCoeff: -7,
  },
  {
    Icon: FileCodeIcon,
    title: "Custom code",
    description: "Customize everything with your own Javascript & CSS Code",
    rotateCoeff: -2,
  },
  {
    Icon: ZapIcon,
    title: "Custom domain",
    description: "Connect your typebot to the custom URL of your choice",
    rotateCoeff: 2,
  },
  {
    Icon: DatabaseIcon,
    title: "Integration platforms",
    description:
      "HTTP requests, OpenAI, Google Sheets, Google Analytics, Meta Pixel, and a lot more",
    rotateCoeff: -4,
  },
] as const;

const cardSize = {
  width: 458,
  height: 248,
};
const paddingTop = 128;
const headerHeight = 172;
const gapHeaderAndCard = 86;

export const AllFeatures = () => {
  return (
    <div
      className="flex flex-col gap-8 w-full max-w-7xl md:pt-[--padding-top] md:pb-[calc(100vh-var(--padding-top)-var(--header-height))]"
      style={
        {
          "--total-cards": cards.length,
          "--padding-top": `${paddingTop}px`,
          "--header-height": `${headerHeight}px`,
          "--card-width": `${cardSize.width}px`,
          "--card-height": `${cardSize.height}px`,
          "--gap-header-and-card": `${gapHeaderAndCard}px`,
        } as React.CSSProperties
      }
    >
      <div className="md:overflow-visible flex flex-col items-center md:h-all-features-sticky-container">
        <div className="md:sticky flex flex-col md:justify-between items-center max-w-xl flex-shrink-0 top-[--padding-top] md:h-[--header-height] gap-6 md:gap-0">
          <h2 className="px-4 text-center">
            All the features you need to hack bots building
          </h2>
          <ButtonLink
            variant="cta"
            size="lg"
            className="hidden md:inline-flex"
            href={registerUrl}
          >
            Create a bot for free
          </ButtonLink>
        </div>

        <ul
          style={{
            viewTimelineName: "--cards-container",
          }}
          className="w-full md:w-auto px-4 md:px-0 overflow-x-auto snap-x scroll-px-4 snap-always no-scrollbar snap-mandatory md:overflow-x-visible flex md:flex-col pt-8 md:pt-[calc(100vh-var(--padding-top)-var(--header-height))] md:gap-[calc(100vh-var(--padding-top)-var(--header-height)-var(--gap-header-and-card)-var(--card-height))] gap-2"
        >
          <Dots />

          {cards.map((feature, index) => (
            <li
              className="min-w-[calc(100%-.75rem)] snap-start md:sticky top-[calc(var(--padding-top)+var(--header-height)+var(--gap-header-and-card))]"
              key={index}
              style={
                {
                  "--rotate-angle": `${feature.rotateCoeff}deg`,
                } as React.CSSProperties
              }
            >
              <FeatureCard
                key={feature.title}
                index={index}
                feature={feature}
                className="md:animate-slight-random-rotate md:w-[--card-width] md:h-[--card-height]"
                style={{
                  animationTimeline: "--cards-container",
                  animationRange: `exit-crossing calc(${index / cards.length} * 100%) exit-crossing calc(${(index + 1) / cards.length} * 100%)`,
                }}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="md:hidden px-4">
        <ButtonLink variant="cta" size="lg" href={registerUrl}>
          Create a bot for free
        </ButtonLink>
      </div>
    </div>
  );
};

const FeatureCard = ({
  index,
  feature,
  className,
  style,
}: {
  index: number;
  feature: (typeof cards)[number];
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <Card
      className={cn(
        "flex flex-col items-center gap-6 h-64 md:h-auto",
        className,
      )}
      style={style}
    >
      <div
        className={`size-16 flex items-center justify-center rounded-2xl bg-cover`}
        style={{
          backgroundImage: `url('${bgImageSrcs[index]}')`,
        }}
      >
        <feature.Icon className="size-6 text-gray-1" />
      </div>
      <div className="flex flex-col gap-2 text-center max-w-xs">
        <h2 className="text-2xl">{feature.title}</h2>
        <p className="text-gray-11">{feature.description}</p>
      </div>
    </Card>
  );
};

const Dots = () => (
  <div
    className="fixed hidden md:flex flex-col gap-4 ml-12 opacity-0 left-0 pointer-events-none top-[calc(var(--padding-top)+var(--header-height)+var(--gap-header-and-card))]"
    style={{
      animation: "fade-in ease-out forwards, fade-out ease-out forwards",
      animationTimeline: "--cards-container",
      animationRange: `exit-crossing 0% exit-crossing 10%, exit-crossing 80% exit-crossing 90%`,
    }}
  >
    {cards.map((_, index) => (
      <div
        key={index}
        className="size-2 rounded-full bg-gray-3"
        style={{
          animation: "fill-carousel-dot ease-out forwards",
          animationTimeline: "--cards-container",
          animationRange: `exit-crossing calc(${index / (cards.length + 1)} * 100%) exit-crossing calc(${(index + 1) / (cards.length + 1)} * 100%)`,
        }}
      />
    ))}
  </div>
);
