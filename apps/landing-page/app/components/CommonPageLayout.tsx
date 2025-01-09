import { TopBar } from "@/features/homepage/hero/TopBar";
import { cn } from "@/lib/utils";
import { Portal } from "@ark-ui/react/portal";
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
      <Portal>
        <div className="fixed top-4 md:bottom-12 md:top-auto w-full motion-preset-slide-up">
          <Header />
        </div>
      </Portal>

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
