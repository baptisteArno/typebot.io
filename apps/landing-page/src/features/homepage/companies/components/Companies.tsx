import {
  Cora,
  IbanFirst,
  Lemlist,
  MakerLead,
  Mindeo,
  Obole,
  PinpointInteractive,
  Shadow,
  SocialHackrs,
} from "./logos";
import { Marquee } from "./Marquee";

export const Companies = () => (
  <div className="flex w-full flex-col gap-6 md:gap-12 items-center">
    <h2 className=" px-4 font-medium max-w-6xl">
      Trusted by 650+ companies worldwide
    </h2>
    <div className="relative isolate flex w-full justify-center">
      <Marquee>
        <MakerLead width="100px" height="60px" />
        <Shadow width="100px" height="60px" />
        <Cora width="80px" height="60px" />
        <IbanFirst width="100px" height="60px" />
        <SocialHackrs width="100px" height="60px" />
        <Lemlist width="100px" height="60px" />
        <PinpointInteractive width="100px" height="60px" />
        <Mindeo width="100px" height="60px" />
        <Obole width="80px" height="60px" />
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[50px] bg-gradient-to-r from-gray-2/20 to-gray-2 " />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[50px] bg-gradient-to-l from-gray-2/20 to-gray-2" />
    </div>
  </div>
);
