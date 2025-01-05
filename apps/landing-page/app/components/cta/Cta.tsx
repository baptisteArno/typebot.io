import { Button } from "@/components/Button";
import magicWand from "./assets/magic-wand.png";

export const Cta = () => {
  return (
    <div className="dark rounded-2xl flex flex-col gap-12 py-12 px-4 items-center max-w-7xl w-full">
      <img src={magicWand} alt="magic wand" className="size-24" />
      <h2 className="text-center px-5 text-balance max-w-5xl">
        Ready to dive into the latest tools and hack your business growth?
      </h2>
      <div className="flex flex-col gap-2 items-center w-full px-2">
        <Button variant="cta" size="lg">
          Get started free
        </Button>
        <p className="text-gray-11 text-center">
          No trial. Generous free plan.
        </p>
      </div>
    </div>
  );
};
