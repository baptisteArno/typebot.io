import { MetaLogo } from "@/components/logos/MetaLogo";

export const PixelLogo = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <MetaLogo {...props} className={className} />
);
