import { registerWebComponents } from "./register";
import { injectTypebotInWindow, parseTypebot } from "./window";

registerWebComponents();

const typebot = parseTypebot();

injectTypebotInWindow(typebot);

export default typebot;
