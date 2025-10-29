import { cn } from "@typebot.io/ui/lib/cn";
import * as React from "react";

const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full overflow-auto", className)} {...props}>
    <table
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Root.displayName = "TableRoot";

const Header = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
Header.displayName = "TableHeader";

const Body = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
Body.displayName = "TableBody";

const Footer = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium last:[&>tr]:border-b-0",
      className,
    )}
    {...props}
  />
));
Footer.displayName = "TableFooter";

const Row = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
));
Row.displayName = "TableRow";

const Head = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 py-4 text-left first:pl-4 align-middle font-bold text-gray-11 [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
Head.displayName = "TableHead";

const Cell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-2 py-4 align-middle first:pl-4 [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
Cell.displayName = "TableCell";

const Caption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-gray-11", className)}
    {...props}
  />
));
Caption.displayName = "TableCaption";

export const Table = {
  Root,
  Header,
  Body,
  Footer,
  Head,
  Row,
  Cell,
  Caption,
};
