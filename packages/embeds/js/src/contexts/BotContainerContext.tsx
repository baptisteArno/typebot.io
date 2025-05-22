import { type Accessor, createContext, useContext } from "solid-js";

export const BotContainerContext = createContext<
  Accessor<HTMLDivElement | undefined>
>(() => undefined);

export const useBotContainer = () => useContext(BotContainerContext);
