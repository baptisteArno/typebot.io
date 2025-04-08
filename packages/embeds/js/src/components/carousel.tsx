import { Carousel as ArkCarousel } from "@ark-ui/solid";

const Root = (props: ArkCarousel.RootProps) => {
  return <ArkCarousel.Root {...props} />;
};

const Control = (props: ArkCarousel.ControlProps) => {
  return <ArkCarousel.Control {...props} />;
};

const PrevTrigger = (props: ArkCarousel.PrevTriggerProps) => {
  return <ArkCarousel.PrevTrigger {...props} />;
};

const NextTrigger = (props: ArkCarousel.NextTriggerProps) => {
  return <ArkCarousel.NextTrigger {...props} />;
};

const ItemGroup = (props: ArkCarousel.ItemGroupProps) => {
  return <ArkCarousel.ItemGroup {...props} />;
};

const Item = (props: ArkCarousel.ItemProps) => {
  return <ArkCarousel.Item {...props} />;
};

export const Carousel = {
  Root,
  Control,
  PrevTrigger,
  NextTrigger,
  ItemGroup,
  Item,
};
