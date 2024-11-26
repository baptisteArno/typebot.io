import { Marquee } from "@/components/Marquee";
import {
  Awwwsome,
  IbanFirst,
  Lemlist,
  MakerLead,
  Obole,
  PinpointInteractive,
  Shadow,
  SocialHackrs,
  Webisharp,
} from "./Brands";

export const Companies = () => (
  <div className="flex w-full flex-col gap-6">
    <h2 className="text-center text-4xl font-medium">
      Trusted by 650+ companies worldwide
    </h2>
    <div className="relative flex w-full">
      <Marquee>
        <IbanFirst width="100px" height="60px" />
        <MakerLead width="100px" height="60px" />
        <Webisharp width="100px" height="60px" />
        <Shadow width="100px" height="60px" />
        <SocialHackrs width="100px" height="60px" />
        <Lemlist width="100px" height="60px" />
        <PinpointInteractive width="100px" height="60px" />
        <Obole width="80px" height="60px" />
        <Awwwsome width="100px" height="60px" />
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[50px] bg-gradient-to-r from-gray-1/20 to-gray-1 " />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[50px] bg-gradient-to-l from-gray-1/20 to-gray-1" />
    </div>
  </div>
);
