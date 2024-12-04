import { Button } from "@/components/button";
import { HeroHeading } from "./HeroHeading";

export const Hero = () => (
  <main className="flex justify-center px-4 pt-36 pb-20">
    <div className="flex flex-col items-center px-2 gap-10">
      <HeroHeading />
      <p
        className="text-center text-gray-400 font-normal opacity-0 animate-slide-fade-in text-gray-11 text-balance"
        style={{ animationDelay: "1.7s", animationFillMode: "forwards" }}
      >
        With Typebot, chatbot becomes a resource where the possibilities to chat
        are wide and conversion is high. Scroll to see why!
      </p>

      <Button
        className="opacity-0 animate-slide-fade-in"
        style={{ animationDelay: "1.9s", animationFillMode: "forwards" }}
        variant="cta"
        size="lg"
      >
        Start building
      </Button>
    </div>
  </main>
);
