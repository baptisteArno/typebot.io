import type { ColonSeparatedText } from "../types";

export type DepartmentCardData = {
  title: string;
  sub: string;
  bulletPoints: ColonSeparatedText[];
  image: {
    src: string;
    alt: string;
  };
};
