import {
  type ButtonProps,
  buttonVariants,
} from "@typebot.io/ui/components/Button";
import { cn } from "@typebot.io/ui/lib/cn";
import Link, { type LinkProps } from "next/link";

export type ButtonLinkProps = {
  href: LinkProps["href"] | undefined;
  target?: HTMLAnchorElement["target"];
  children: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  iconStyle?: ButtonProps["iconStyle"];
  disabled?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const ButtonLink = ({
  href,
  children,
  target,
  variant,
  size,
  disabled,
  className,
  iconStyle,
  onMouseEnter,
  onMouseLeave,
}: ButtonLinkProps) => {
  if (!href) return null;
  return (
    <Link
      href={href}
      target={target}
      className={cn(buttonVariants({ variant, size, iconStyle }), className)}
      data-disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Link>
  );
};
