import {
  close,
  hideMessage,
  open,
  setHiddenVariables,
  showMessage,
  toggle,
} from "./commands";
import { getBubbleActions, initBubble } from "./embedTypes/chat";
import { initContainer } from "./embedTypes/container";
import { getPopupActions, initPopup } from "./embedTypes/popup";

export {
  initContainer,
  initPopup,
  initBubble,
  getPopupActions,
  getBubbleActions,
  open,
  close,
  toggle,
  showMessage,
  hideMessage,
  setHiddenVariables,
};

const defaultExports = {
  initContainer,
  initPopup,
  initBubble,
  getPopupActions,
  getBubbleActions,
  open,
  close,
  toggle,
  showMessage,
  hideMessage,
  setHiddenVariables,
};

export default defaultExports;

export * from "./types";
