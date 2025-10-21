import { ArrowUpRight01Icon } from "@typebot.io/ui/icons/ArrowUpRight01Icon";
import { cx } from "@typebot.io/ui/lib/cva";
import Link from "next/link";

type TextLinkProps = {
  className?: string;
  href: string;
  shallow?: boolean;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  isExternal?: boolean;
  children?: React.ReactNode;
};

export const TextLink = ({
  className,
  children,
  href,
  shallow,
  replace,
  scroll,
  prefetch,
  isExternal,
}: TextLinkProps) => (
  <Link
    href={href}
    shallow={shallow}
    replace={replace}
    scroll={scroll}
    prefetch={prefetch}
    target={isExternal ? "_blank" : undefined}
  >
    <span className={cx("underline inline-block", className)}>
      {isExternal ? (
        <span className="flex items-center gap-1">
          <span className="line-clamp-1 max-w-full">{children}</span>
          <ArrowUpRight01Icon />
        </span>
      ) : (
        children
      )}
    </span>
  </Link>
);
