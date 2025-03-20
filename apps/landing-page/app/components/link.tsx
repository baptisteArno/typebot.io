import { type LinkComponentProps, createLink } from "@tanstack/react-router";
import { buttonVariants } from "@typebot.io/ui/components/Button";
import { ArrowUpRightIcon } from "@typebot.io/ui/icons/ArrowUpRightIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { type VariantProps, cva } from "@typebot.io/ui/lib/cva";
import { type HTMLProps, forwardRef } from "react";

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const textLinkVariants = cva("inline-flex gap-1 font-medium hover:underline", {
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
    VariantProps<typeof textLinkVariants> {
  hideExternalIcon?: boolean;
}

export const TextLinkComponent = forwardRef<
  HTMLAnchorElement,
  CustomTextLinkProps
>(({ children, className, size, hideExternalIcon, ...props }, ref) => {
  return (
    <a
      ref={ref}
      {...props}
      className={cn(textLinkVariants({ size }), className)}
    >
      {children}
      {props.target === "_blank" && !hideExternalIcon && (
        <ArrowUpRightIcon className={textLinkIconVariants({ size })} />
      )}
    </a>
  );
});
const CreatedTextLinkComponent = createLink(TextLinkComponent);

export const TextLink = (
  props: Optional<LinkComponentProps<typeof TextLinkComponent>, "to">,
) => {
  if (props.href && typeof props.children !== "function")
    return (
      <TextLinkComponent
        className={props.className}
        href={props.href}
        target={props.target}
        size={props.size}
        hideExternalIcon={props.hideExternalIcon}
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
>(({ variant, className, size, children, ...props }, ref) => {
  const anchorElement = (
    <a
      className={cn(
        buttonVariants({ variant, size, className }),
        variant?.includes("cta") && "w-full",
      )}
      ref={ref}
      {...props}
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

export const ButtonLink = (
  props: Optional<LinkComponentProps<typeof ButtonLinkComponent>, "to">,
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
