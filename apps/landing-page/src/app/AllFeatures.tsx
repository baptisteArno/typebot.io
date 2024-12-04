import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { cn } from "@/lib/utils";
import { BracesIcon } from "@typebot.io/ui/icons/BracesIcon";
import { DatabaseIcon } from "@typebot.io/ui/icons/DatabaseIcon";
import { FileCodeIcon } from "@typebot.io/ui/icons/FileCodeIcon";
import { LinkIcon } from "@typebot.io/ui/icons/LinkIcon";
import { UsersIcon } from "@typebot.io/ui/icons/UsersIcon";
import { ZapIcon } from "@typebot.io/ui/icons/ZapIcon";

const data = [
  {
    Icon: BracesIcon,
    title: "Hidden fields",
    description:
      "Include data in your form URL to segment your user and use its data directly in your form.",
  },
  {
    Icon: UsersIcon,
    title: "Team collaboration",
    description:
      "Sharing is caring: invite your teammates to work on your typebots with you",
  },
  {
    Icon: LinkIcon,
    title: "Link to sub typebots",
    description:
      "For the in-depth analytics lovers who want to see flow with drop-off rate etc.",
  },
  {
    Icon: FileCodeIcon,
    title: "Custom code",
    description: "Customize everything with your own Javascript & CSS Code",
  },
  {
    Icon: ZapIcon,
    title: "Custom domain",
    description: "Connect your typebot to the custom URL of your choice",
  },
  {
    Icon: DatabaseIcon,
    title: "Integration platforms",
    description:
      "HTTP requests, OpenAI, Google Sheets, Google Analytics, Meta Pixel, Zapier, Make.com, Chatwoot, and more to come",
  },
] as const;

export const AllFeatures = () => {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="px-4">All the features you need to hack bots building</h2>
      <div className="flex gap-2 overflow-x-auto snap-x scroll-px-4 snap-always no-scrollbar px-4 snap-mandatory">
        {data.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            index={index}
            className="min-w-[calc(100%-.75rem)] snap-start "
            feature={feature}
          />
        ))}
      </div>
      <div className="px-4">
        <Button variant="cta" size="lg">
          Get started for free
        </Button>
      </div>
    </div>
  );
};

const FeatureCard = ({
  index,
  feature,
  className,
}: {
  index: number;
  feature: (typeof data)[number];
  className?: string;
}) => {
  return (
    <Card className={cn(className, "flex flex-col items-center gap-6")}>
      <div
        className={`size-16 flex items-center justify-center rounded-2xl bg-cover`}
        style={{
          backgroundImage: `url('/images/sections/all-features/${index}.png')`,
        }}
      >
        <feature.Icon className="size-6 text-gray-1" />
      </div>
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl">{feature.title}</h2>
        <p className="text-gray-11">{feature.description}</p>
      </div>
    </Card>
  );
};
