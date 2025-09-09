import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TopBar } from "@/features/homepage/hero/TopBar";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <>
      <div className="flex w-full justify-center">
        <TopBar className="hidden md:flex" />
      </div>
      <Outlet />
    </>
  );
}
