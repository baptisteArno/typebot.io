import { TopBar } from "@/features/homepage/hero/TopBar";
import { Outlet, createFileRoute } from "@tanstack/react-router";

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
