import { Marquee } from "./Marquee";
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
} from "./logos";

export const Companies = () => (
  <div className="flex w-full flex-col gap-6 md:gap-12 items-center">
    <h2 className=" px-4 font-medium max-w-6xl">
      Trusted by 650+ companies worldwide
    </h2>
    <div className="hidden md:flex items-center gap-16 px-4">
      <MakerLead className="w-32 flex-shrink-0" />
      <Webisharp className="w-32 flex-shrink-0" />
      <Shadow className="w-28 flex-shrink-0" />
      <IbanFirst className="w-28 flex-shrink-0" />
      <Lemlist className="w-28 flex-shrink-0" />
      <SocialHackrs className="w-32 flex-shrink-0" />
      <PinpointInteractive className="w-32 flex-shrink-0" />
      <Awwwsome className="w-32 flex-shrink-0" />
    </div>
    <div className="relative flex w-full md:hidden">
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
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[50px] bg-gradient-to-r from-gray-2/20 to-gray-2 " />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[50px] bg-gradient-to-l from-gray-2/20 to-gray-2" />
    </div>
  </div>
);
