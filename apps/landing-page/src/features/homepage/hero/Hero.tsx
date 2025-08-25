import { CtaButtonLink } from "@/components/link";
import { registerUrl } from "@/constants";
import { TopBar } from "./TopBar";

const heroTextHeight = 276;

export const Hero = () => (
  <main
    className="relative isolate flex flex-col items-center md:h-[300vh] w-full"
    style={
      {
        viewTimelineName: "--hero",
        "--hero-text-height": `${heroTextHeight}px`,
      } as React.CSSProperties
    }
  >
    <div className="dark flex w-full justify-center sticky top-4 px-4">
      <TopBar className="hidden md:flex" />
    </div>
    <div className="flex flex-col items-center px-2 gap-10 pb-44 md:sticky md:top-[calc(100vh/2-var(--hero-text-height)/2)] flex-shrink-0 pt-32 md:pt-0">
      <h1 className="text-center uppercase font-bold text-balance">
        <span className="hero-text-blur-in inline-block motion-delay-500">
          Hack the bot game:
        </span>
        <br />
        <span className="hero-text-blur-in motion-delay-700 inline-block">
          Build faster,{" "}
        </span>
        <br />
        <span className="hero-text-blur-in motion-delay-[900ms] inline-block">
          Chat smarter
        </span>
      </h1>
      <p className="text-center text-gray-400 font-normal text-gray-11 text-balance md:text-xl max-w-3xl hero-text-blur-in motion-delay-1500">
        Typebot is a no-code platform that enables you to effortlessly create
        and integrate advanced chatbots into websites and chat platforms like
        WhatsApp.
      </p>

      <CtaButtonLink
        className="hero-text-blur-in motion-delay-2000 md:hidden"
        size="lg"
        href={registerUrl}
      >
        Start building
      </CtaButtonLink>
    </div>
    <div
      className="h-screen w-full sticky inset-0 px-0 rounded-3xl animate-magic-zoom opacity-0 hidden md:motion-reduce:hidden md:supports-scrollanimation:block bg-[url('$magicBackgrounds/magic-background-desktop.png')] bg-no-repeat bg-[length:100%]"
      style={{
        animationTimeline: "--hero",
        animationRange: "contain 0% exit-crossing 50%",
      }}
    >
      <div
        className="bg-[url('$magicBackgrounds/magic-background.png')] bg-no-repeat bg-[length:100%] size-full absolute top-0 animate-magic-zoom-blur"
        style={{
          animationTimeline: "--hero",
          animationRange: "contain 0% exit-crossing 50%",
        }}
      />
    </div>
  </main>
);
