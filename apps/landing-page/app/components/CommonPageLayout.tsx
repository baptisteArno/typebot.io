import { TopBar } from "@/features/homepage/hero/TopBar";
import { Header } from "./Header";
import { Footer } from "./footer/Footer";

export const CommonPageLayout = ({
  children,
}: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-stretch">
      <div className="flex w-full justify-center">
        <TopBar className="hidden md:flex" />
      </div>
      <div className="fixed top-4 md:bottom-12 md:top-auto z-10 w-full">
        <Header />
      </div>
      {children}
      <Footer />
    </div>
  );
};
