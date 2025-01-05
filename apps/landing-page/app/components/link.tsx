import { cn } from "@/lib/utils";
import { type LinkComponent, createLink } from "@tanstack/react-router";
import { ArrowUpRightIcon } from "@typebot.io/ui/icons/ArrowUpRightIcon";
import { type VariantProps, cva } from "class-variance-authority";
import { type HTMLProps, forwardRef } from "react";
import { buttonVariants } from "./Button";

const textLinkVariants = cva("inline-flex gap-1 font-medium underline", {
  variants: {
    size: {
      default: "",
      sm: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const textLinkIconVariants = cva("mt-0.5", {
  variants: {
    size: {
      default: "text-lg w-6",
      sm: "w-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface CustomTextLinkProps
  extends Pick<
      HTMLProps<HTMLAnchorElement>,
      "href" | "target" | "className" | "children"
    >,
    VariantProps<typeof textLinkVariants> {}

export const TextLinkComponent = forwardRef<
  HTMLAnchorElement,
  CustomTextLinkProps
>(({ children, className, size, href, target }, ref) => {
  return (
    <a
      ref={ref}
      className={cn(textLinkVariants({ size }), className)}
      href={href}
      target={target}
    >
      {children}
      {target === "_blank" && (
        <ArrowUpRightIcon className={textLinkIconVariants({ size })} />
      )}
    </a>
  );
});
const CreatedTextLinkComponent = createLink(TextLinkComponent);

export const TextLink: LinkComponent<typeof TextLinkComponent> = (props) => {
  if (props.href && typeof props.children !== "function")
    return (
      <TextLinkComponent
        className={props.className}
        href={props.href}
        target={props.target}
        size={props.size}
      >
        {props.children}
      </TextLinkComponent>
    );
  return <CreatedTextLinkComponent preload={"intent"} {...props} />;
};

interface CustomButtonLinkProps
  extends Pick<
      HTMLProps<HTMLAnchorElement>,
      "href" | "target" | "className" | "children"
    >,
    VariantProps<typeof buttonVariants> {}

export const ButtonLinkComponent = forwardRef<
  HTMLAnchorElement,
  CustomButtonLinkProps
>(({ href, variant, className, size, children }, ref) => {
  const anchorElement = (
    <a
      className={cn(
        buttonVariants({ variant, size, className }),
        variant?.includes("cta") && "w-full",
      )}
      ref={ref}
      href={href}
    >
      {children}
    </a>
  );

  if (variant === "cta" || variant === "ctaSecondary")
    return (
      <div className="overflow-hidden rounded-lg relative">{anchorElement}</div>
    );

  return anchorElement;
});
const CreatedButtonLinkComponent = createLink(ButtonLinkComponent);

export const ButtonLink: LinkComponent<typeof ButtonLinkComponent> = (
  props,
) => {
  if (props.href && typeof props.children !== "function")
    return (
      <ButtonLinkComponent
        className={props.className}
        href={props.href}
        target={props.target}
        size={props.size}
        variant={props.variant}
      >
        {props.children}
      </ButtonLinkComponent>
    );
  return <CreatedButtonLinkComponent preload={"intent"} {...props} />;
};
