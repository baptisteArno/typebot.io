import type { ButtonParams } from "../../types";

export const createButton = (params?: ButtonParams): HTMLButtonElement => {
  const button = document.createElement("button");
  button.id = "typebot-bubble-button";
  button.style.backgroundColor = params?.color ?? "#0042DA";
  button.appendChild(
    createButtonIcon(params?.iconUrl, params?.iconColor, params?.iconStyle),
  );
  button.appendChild(
    createCloseIcon(params?.iconColor ?? params?.closeIconColor),
  );
  return button;
};

const createButtonIcon = (
  src?: string,
  iconColor?: string,
  style?: string,
): SVGElement | HTMLElement => {
  if (!src) return createDefaultIcon(iconColor);
  const icon = document.createElement("img");
  icon.classList.add("icon");
  icon.src = src;
  if (style) icon.setAttribute("style", style);
  return icon;
};

const createDefaultIcon = (iconColor?: string): SVGElement => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.innerHTML = typebotLogoSvgTextContent();
  icon.classList.add("icon");
  icon.style.stroke = iconColor ?? "#ffffff";
  return icon;
};

const createCloseIcon = (iconColor?: string): SVGElement => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.innerHTML = closeSvgPath;
  icon.classList.add("close-icon");
  icon.style.stroke = iconColor ?? "#ffffff";
  return icon;
};

const typebotLogoSvgTextContent = () =>
  `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>`;

export const closeSvgPath = `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`;
