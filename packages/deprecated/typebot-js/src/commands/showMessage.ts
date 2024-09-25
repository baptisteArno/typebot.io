import { openProactiveMessage } from "../embedTypes/chat/proactiveMessage";

export const showMessage = () => {
  const existingBubble = document.querySelector("#typebot-bubble");
  if (existingBubble) openProactiveMessage(existingBubble);
};
