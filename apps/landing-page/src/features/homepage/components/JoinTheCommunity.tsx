import { cx } from "@typebot.io/ui/lib/cva";
import { CtaButtonLink } from "@/components/link";
import { discordUrl } from "../../../constants";
import abhaySrc from "../testimonials/assets/abhay.jpeg";
import annaFilouSrc from "../testimonials/assets/annaFilou.jpeg";
import barrettaSrc from "../testimonials/assets/barretta.jpeg";
import joshuaSrc from "../testimonials/assets/joshua.jpg";
import kurniaSrc from "../testimonials/assets/kurnia.jpeg";
import laszloSrc from "../testimonials/assets/laszlo.jpeg";
import lucasSrc from "../testimonials/assets/lucas.png";
import nicolaiSrc from "../testimonials/assets/nicolai.jpg";

const stats = [
  {
    stat: "2M+",
    label: "monthly chats",
  },
  {
    stat: "1.5M+",
    label: "bots published",
  },
  {
    stat: "3,000+",
    label: "members on Discord",
  },
];

const avatars = [
  {
    src: abhaySrc,
    alt: "Community member 1 avatar",
    position: "top-1 left-36",
  },
  {
    src: laszloSrc,
    alt: "Community member 2 avatar",
    position: "top-32 left-4 motion-delay-500",
  },
  {
    src: joshuaSrc,
    alt: "Community member 3 avatar",
    position: "bottom-8 left-24 motion-delay-300",
  },
  {
    src: lucasSrc,
    alt: "Community member 4 avatar",
    position: "-bottom-7 -left-7 motion-delay-700",
  },
  {
    src: kurniaSrc,
    alt: "Community member 5 avatar",
    position: "top-1 right-36 motion-delay-1000",
  },
  {
    src: nicolaiSrc,
    alt: "Community member 6 avatar",
    position: "top-28 right-4 motion-delay-500",
  },
  {
    src: barrettaSrc,
    alt: "Community member 7 avatar",
    position: "bottom-12 right-32 motion-delay-300",
  },
  {
    src: annaFilouSrc,
    alt: "Community member 8 avatar",
    position: "bottom-7 -right-7",
  },
];

export const JoinTheCommunity = () => (
  <div className="flex flex-col bg-gray-1 rounded-2xl w-full max-w-7xl">
    <div className="relative isolate flex dark rounded-2xl md:rounded-b-none p-6 pt-12 md:pb-12 justify-center overflow-hidden">
      <FloatingAvatars className="hidden md:block" />
      <div className="flex flex-col gap-12 md:items-center max-w-4xl">
        <div className="flex flex-col gap-6 text-balance md:text-center">
          <h2 className="text-gray-12">
            Together, we&apos;re hacking the future of
            <br className="hidden md:block" />
            conversational AI apps
          </h2>
          <p className="text-gray-11">
            Join the Typebot community to connect with chatbot enthusiasts,
            share insights, and learn together to create advanced automations.
            Get exclusive resources, influence product development, and be part
            of a network that's shaping the future of conversational apps.
          </p>
        </div>
        <CtaButtonLink size="lg" href={discordUrl} target="_blank">
          Join the community
        </CtaButtonLink>
      </div>
    </div>
    <div className="flex flex-col md:flex-row justify-evenly gap-6 p-6 md:p-8">
      {stats.map(({ stat, label }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <span className="text-4xl font-heading font-medium">{stat}</span>
          <span className="text-gray-11">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

const FloatingAvatars = ({ className }: { className?: string }) => (
  <div className={className}>
    {avatars.map(({ src, alt, position }) => (
      <img
        key={alt}
        src={src}
        alt={alt}
        className={cx(
          `rounded-full w-16 h-16 border-4 absolute motion-preset-oscillate-sm motion-duration-[4000ms]`,
          position,
        )}
      />
    ))}
  </div>
);
