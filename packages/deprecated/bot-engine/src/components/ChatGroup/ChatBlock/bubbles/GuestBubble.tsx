import { Avatar } from "@/components/avatars/Avatar";
import React, { useState } from "react";
import { CSSTransition } from "react-transition-group";

interface Props {
  message: string;
  showAvatar: boolean;
  avatarSrc?: string;
}

export const GuestBubble = ({
  message,
  showAvatar,
  avatarSrc,
}: Props): JSX.Element => {
  const [content] = useState(message);

  return (
    <CSSTransition classNames="bubble" timeout={1000}>
      <div
        className="flex justify-end mb-2 items-end"
        style={{ marginLeft: "50px" }}
      >
        <span
          className="px-4 py-2 rounded-lg mr-2 whitespace-pre-wrap max-w-full typebot-guest-bubble cursor-pointer"
          data-testid="guest-bubble"
        >
          {content}
        </span>
        {showAvatar && <Avatar avatarSrc={avatarSrc} />}
      </div>
    </CSSTransition>
  );
};
