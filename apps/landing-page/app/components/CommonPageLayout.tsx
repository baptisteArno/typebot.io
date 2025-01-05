import { TopBar } from "@/features/homepage/hero/TopBar";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Footer } from "./footer/Footer";

export const CommonPageLayout = ({
  children,
  className,
}: { children: React.ReactNode; className?: string }) => {
  return (
    <div className="flex flex-col items-stretch">
      <div className="flex w-full justify-center">
        <TopBar className="hidden md:flex" />
      </div>
      <div className="fixed top-4 md:bottom-12 md:top-auto z-10 w-full">
        <Header />
      </div>
      <div
        className={cn(
          "flex flex-col max-w-7xl mx-auto gap-12 pt-32 md:pt-20 w-full pb-20 md:pb-32 px-4",
          className,
        )}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
};
