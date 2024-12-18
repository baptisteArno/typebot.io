import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-service")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/terms-of-service"!</div>;
}
