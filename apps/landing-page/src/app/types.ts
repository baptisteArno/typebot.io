import type { StaticImageData } from "next/image";

type ColonSeparatedText = {
  main: string;
  sub: string;
};

export type FeatureCardData = {
  title: ColonSeparatedText;
  description: string;
  link?: {
    src: string;
    text: string;
  };
  video: {
    src: string;
  };
};

export type DepartmentCardData = {
  title: string;
  sub: string;
  bulletPoints: ColonSeparatedText[];
  image: {
    src: StaticImageData;
    alt: string;
    gradientPlacement: "right" | "left";
  };
};
