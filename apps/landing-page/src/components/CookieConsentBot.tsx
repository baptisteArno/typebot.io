import { Bubble, close } from "@typebot.io/react";
import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  openDelay: number;
  onSubmit: (consent: "accepted" | "declined") => void;
};

export const CookieConsentBot = ({ isOpen, onSubmit, openDelay }: Props) => {
  const isOpenDelayed = useDelayedOpen(isOpen, openDelay);

  return (
    <Bubble
      id="cookie-consent"
      typebot="cookie-consent"
      isOpen={isOpenDelayed}
      theme={{
        placement: "left",
        button: {
          isHidden: true,
        },
        chatWindow: {
          maxHeight: "250px",
          maxWidth: "450px",
        },
      }}
      onEnd={() => {
        close({ id: "cookie-consent" });
      }}
      onAnswer={({ message }) => {
        onSubmit(parseConsentBotAnswer(message));
      }}
    />
  );
};

const parseConsentBotAnswer = (answer: string) => {
  return answer.toLowerCase().trim() === "accept" ? "accepted" : "declined";
};

const useDelayedOpen = (isOpen: boolean, openDelay: number) => {
  const [isOpenDelayed, setIsOpenDelayed] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isOpen === false) setIsOpenDelayed(false);
    else
      timeout = setTimeout(() => {
        setIsOpenDelayed(isOpen);
      }, openDelay);
    return () => clearTimeout(timeout);
  }, [isOpen, openDelay]);

  return isOpenDelayed;
};
