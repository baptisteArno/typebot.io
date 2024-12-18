import { Button } from "@/components/Button";
import { HeroHeading } from "./HeroHeading";

export const Hero = () => (
  <main className="flex justify-center px-4 items-center pt-36 md:min-h-screen md:pt-0">
    <div className="flex flex-col items-center px-2 gap-10 pb-36">
      <HeroHeading />
      <p
        className="text-center text-gray-400 font-normal opacity-0 animate-slide-fade-in text-gray-11 text-balance md:text-xl max-w-3xl"
        style={{ animationDelay: "1.7s", animationFillMode: "forwards" }}
      >
        Typebot is a no-code platform that enables you to effortlessly create
        and integrate advanced chatbots into websites and chat platforms like
        WhatsApp.
      </p>

      <Button
        className="opacity-0 animate-slide-fade-in md:hidden"
        style={{ animationDelay: "1.9s", animationFillMode: "forwards" }}
        variant="cta"
        size="lg"
      >
        Start building
      </Button>
    </div>
  </main>
);
