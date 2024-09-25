import type { IMjmlButtonProps } from "@faire/mjml-react";
import { MjmlButton } from "@faire/mjml-react";
import { blue, borderBase, grayLight, leadingTight, textBase } from "../theme";

type ButtonProps = {
  link: string;
  children: React.ReactNode;
} & IMjmlButtonProps;

export const Button = ({ link, children, ...props }: ButtonProps) => (
  <MjmlButton
    lineHeight={leadingTight}
    fontSize={textBase}
    fontWeight="700"
    height={32}
    padding="0"
    align="left"
    href={link}
    backgroundColor={blue}
    color={grayLight}
    borderRadius={borderBase}
    {...props}
  >
    {children}
  </MjmlButton>
);
