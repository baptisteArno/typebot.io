import { useMDXComponent } from "@content-collections/mdx/react";
import { buttonVariants } from "@typebot.io/ui/components/Button";
import { ArrowDown01Icon } from "@typebot.io/ui/icons/ArrowDown01Icon";
import { ArrowUp01Icon } from "@typebot.io/ui/icons/ArrowUp01Icon";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { TickIcon } from "@typebot.io/ui/icons/TickIcon";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import type * as React from "react";
import { Suspense, useState } from "react";
import { Cta } from "@/components/cta/Cta";
import { TextLink } from "@/components/link";
import { Typebot } from "@/components/Typebot";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/table";
import { HtmlFormGenerator } from "./HtmlFormGenerator";
import { WhatsAppPricingCalculator } from "./WhatsAppPricingCalculator";

const components = {
  a: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
    <TextLink {...props} />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn("before:content-none after:content-none", className)}
      {...props}
    />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <TableRoot className="not-prose bg-card rounded-xl border">
      <Table {...props} />
    </TableRoot>
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <TableBody {...props} />
  ),
  tfoot: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <TableFooter {...props} />
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <TableRow {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <TableHead {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <TableCell {...props} />
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <TableHeader {...props} />
  ),
  Image: ({
    alt,
    caption,
    ...props
  }: {
    alt: string;
    src: string;
    width?: number;
    height?: number;
    caption?: string;
  }) =>
    caption ? (
      <figure className="bg-card p-2 rounded-xl border items-start w-auto inline-block mx-auto">
        <img {...props} alt={alt} className="border" />
        <figcaption className="text-center py-1">{caption}</figcaption>
      </figure>
    ) : (
      <img {...props} alt={alt} />
    ),
  Info: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn(
        "flex gap-4 rounded-xl border px-6 bg-card text-card-foreground",
      )}
      {...props}
    >
      <InformationSquareIcon className="size-5 shrink-0 mt-7 stroke-card-foreground" />
      <div>{children}</div>
    </div>
  ),
  Success: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn(
        "flex gap-4 rounded-xl border px-6 bg-violet-50 text-violet-900",
      )}
      {...props}
    >
      <TickIcon className="size-5 shrink-0 mt-7 stroke-violet-600" />
      <div>{children}</div>
    </div>
  ),
  Warning: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn(
        "flex gap-4 rounded-xl border px-6 bg-orange-50 text-orange-800",
      )}
      {...props}
    >
      <TriangleAlertIcon className="size-5 shrink-0 mt-7 stroke-orange-600" />
      <div>{children}</div>
    </div>
  ),
  Cta: ({
    highlight,
    buttonLabel = "Create a typebot",
    children,
  }: {
    highlight?: "default";
    buttonLabel?: string;
    children?: React.ReactNode;
  }) => (
    <Cta className="not-prose" buttonLabel={buttonLabel}>
      {highlight === "default" ? undefined : null}
      {children}
    </Cta>
  ),
  Typebot: (props: any) => (
    <Suspense fallback={<div>Loading...</div>}>
      <Typebot
        style={{
          borderRadius: "0.375rem",
          borderWidth: "1px",
          height: "533px",
          ...props.style,
        }}
        {...props}
      />
    </Suspense>
  ),
  YouTube: ({ id }: { id: string }) => (
    <div className="w-full">
      <div className="relative isolate pb-[64.63195691202873%] h-0 w-full">
        <iframe
          title="Youtube video"
          src={`https://www.youtube.com/embed/${id}`}
          allowFullScreen
          className="absolute inset-0 size-full rounded-xl"
        />
      </div>
    </div>
  ),
  Video: ({ src }: { src: string }) => (
    <div className="w-full">
      {/* biome-ignore lint/a11y/useMediaCaption: Blog videos currently do not ship with caption files. */}
      <video src={src} className="w-full rounded-xl" controls />
    </div>
  ),
  WhatsAppPricingCalculator,
  HtmlFormGenerator,
  Details: ({
    summary,
    children,
    defaultOpen,
  }: {
    summary: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

    return (
      <details
        open={defaultOpen}
        className="rounded-xl border bg-card px-5 py-4 text-card-foreground"
        onToggle={(event) =>
          setIsOpen((event.target as HTMLDetailsElement).open)
        }
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-medium">
          {summary}
          <span
            className={cn(
              buttonVariants({ variant: "secondary", size: "icon" }),
              "shrink-0 [&_svg]:size-5",
            )}
          >
            {isOpen ? <ArrowUp01Icon /> : <ArrowDown01Icon />}
          </span>
        </summary>
        <div className="mt-4 border-t pt-4 [&_pre]:my-0">{children}</div>
      </details>
    );
  },
  Variable: ({ children }: { children: string }) => (
    <code className="bg-gray-300 px-1 py-0.5 rounded-sm text-sm">
      {`{{${children}}}`}
    </code>
  ),
};

interface MdxProps {
  code: string;
}

export const Mdx = ({ code }: MdxProps) => {
  const Component = useMDXComponent(code);

  return <Component components={components} />;
};
