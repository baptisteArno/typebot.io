import { Typebot } from "@/components/Typebot";
import { Cta } from "@/components/cta/Cta";
import { TextLink } from "@/components/link";
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
import { useMDXComponent } from "@content-collections/mdx/react";
import { CheckIcon } from "@typebot.io/ui/icons/CheckIcon";
import { InfoIcon } from "@typebot.io/ui/icons/InfoIcon";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import type * as React from "react";
import { Suspense } from "react";
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
    <TableRoot className="not-prose bg-gray-1 rounded-xl border">
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
      <figure className="bg-gray-1 p-2 rounded-xl border items-start w-auto inline-block mx-auto">
        <img {...props} alt={alt} className="border" />
        <figcaption className="text-center py-1">{caption}</figcaption>
      </figure>
    ) : (
      <img {...props} alt={alt} />
    ),
  Info: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn("flex gap-4 rounded-xl border px-6 bg-gray-1 text-gray-12")}
      {...props}
    >
      <InfoIcon className="size-5 flex-shrink-0 mt-7 stroke-gray-11" />
      <div>{children}</div>
    </div>
  ),
  Success: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn(
        "flex gap-4 rounded-xl border px-6 bg-purple-3 text-purple-12",
      )}
      {...props}
    >
      <CheckIcon className="size-5 flex-shrink-0 mt-7 stroke-purple-11" />
      <div>{children}</div>
    </div>
  ),
  Warning: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn(
        "flex gap-4 rounded-xl border px-6 bg-orange-2 text-orange-12",
      )}
      {...props}
    >
      <TriangleAlertIcon className="size-5 flex-shrink-0 mt-7 stroke-orange-11" />
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
  Youtube: ({ id }: { id: string }) => (
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
      <video src={src} className="w-full rounded-xl" controls />
    </div>
  ),
  WhatsAppPricingCalculator,
  HtmlFormGenerator,
  Variable: ({ children }: { children: string }) => (
    <code className="bg-gray-3 px-1 py-0.5 rounded text-sm">
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
