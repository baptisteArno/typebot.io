export type ColonSeparatedText = {
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
