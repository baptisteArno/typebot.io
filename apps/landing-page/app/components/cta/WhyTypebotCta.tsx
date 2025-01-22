import { registerUrl } from "@/constants";
import { ButtonLink } from "../link";
import imgSrc from "./assets/3d-group.png";

export const WhyTypebotCta = () => (
  <div className="why-cta overflow-hidden relative isolate dark flex justify-between items-center p-4 rounded-3xl w-full">
    <div className="flex flex-col gap-6 flex-1 p-4 md:py-0 md:pl-16 md:pr-20 items-start">
      <h2>Why Typebot?</h2>
      <p>
        I'm Baptiste, a product engineer passionate about creating exceptional
        user experiences. That's why I started working on Typebot three years
        ago. I wanted to make chatbot building intuitive, fun and with a ton of
        options for companies to build advanced chatbots that can fit in a lot
        of scenarios. Typebot is a small company that truly empowers the user,
        the project is fair source and never vendor-locks you in.
      </p>
      <ButtonLink variant="cta" size="lg" href={registerUrl}>
        Start for free
      </ButtonLink>
    </div>
    <img
      src={imgSrc}
      alt="Illustration of typebot's building blocks in 3d"
      className="rounded-3xl max-w-md hidden md:block"
    />
  </div>
);
