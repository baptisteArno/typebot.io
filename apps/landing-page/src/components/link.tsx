import { createLink, type LinkComponentProps } from "@tanstack/react-router";
import { buttonVariants } from "@typebot.io/ui/components/Button";
import { ArrowUpRight01Icon } from "@typebot.io/ui/icons/ArrowUpRight01Icon";
import { cn } from "@typebot.io/ui/lib/cn";
import { cva, type VariantProps } from "@typebot.io/ui/lib/cva";
import { forwardRef, type HTMLProps } from "react";
import { ctaButtonVariants } from "./cta/CtaButton";

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const textLinkVariants = cva(
  "inline-flex font-medium hover:underline items-center",
  {
    variants: {
      size: {
        default: "",
        sm: "text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

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
        <ArrowUpRight01Icon className={textLinkIconVariants({ size })} />
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

interface CtaButtonLinkProps
  extends Pick<
      HTMLProps<HTMLAnchorElement>,
      "href" | "target" | "className" | "children"
    >,
    Omit<VariantProps<typeof buttonVariants>, "variant">,
    VariantProps<typeof ctaButtonVariants> {}

export const CtaButtonLinkComponent = forwardRef<
  HTMLAnchorElement,
  CtaButtonLinkProps
>(({ variant, className, size, children, ...props }, ref) => {
  return (
    <div className="overflow-hidden rounded-lg relative">
      <a
        className={cn(
          buttonVariants({ size, className }),
          ctaButtonVariants({ variant }),
          "w-full",
        )}
        ref={ref}
        {...props}
      >
        {children}
      </a>
    </div>
  );
});
const CreatedCtaButtonLinkComponent = createLink(CtaButtonLinkComponent);

export const CtaButtonLink = (
  props: Optional<LinkComponentProps<typeof CtaButtonLinkComponent>, "to">,
) => {
  if (props.href && typeof props.children !== "function")
    return (
      <CtaButtonLinkComponent
        className={props.className}
        href={props.href}
        target={props.target}
        size={props.size}
        variant={props.variant}
      >
        {props.children}
      </CtaButtonLinkComponent>
    );
  return <CreatedCtaButtonLinkComponent preload={"intent"} {...props} />;
};

interface ButtonLinkProps
  extends Pick<
      HTMLProps<HTMLAnchorElement>,
      "href" | "target" | "className" | "children"
    >,
    VariantProps<typeof buttonVariants> {}

export const ButtonLinkComponent = forwardRef<
  HTMLAnchorElement,
  ButtonLinkProps
>(({ variant, className, size, children, ...props }, ref) => {
  return (
    <a
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </a>
  );
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
