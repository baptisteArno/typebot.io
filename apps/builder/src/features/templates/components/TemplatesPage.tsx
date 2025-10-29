import { Seo } from "@/components/Seo";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { CreateNewTypebotButtons } from "./CreateNewTypebotButtons";

export const TemplatesPage = () => (
  <div className="flex flex-col items-center gap-2 h-screen">
    <Seo title="Templates" />
    <DashboardHeader />
    <CreateNewTypebotButtons />
  </div>
);
