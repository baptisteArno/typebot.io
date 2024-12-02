import { TypebotLogo } from "@/assets/logos/TypebotLogo";
import { Button } from "@/components/button";

export const Cta = () => {
  return (
    <div className="dark rounded-2xl flex flex-col gap-12 py-12 px-4 items-center">
      <TypebotLogo className="w-28" />
      <h2 className="text-center text-4xl px-6">
        Ready to dive into the latest tools and hack your business growth?
      </h2>
      <div className="flex flex-col gap-2 w-full">
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
