import { Button } from "@/components/button";

export const CallToActionSection = () => (
  <div className="flex flex-col gap-6">
    <p className="text-gray-11 text-balance">
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

    <div className="w-full flex flex-col gap-4">
      <Button variant="cta" size="lg">
        Try it out
      </Button>
      <Button variant="ctaSecondary" size="lg">
        Book a demo
      </Button>
    </div>
  </div>
);
