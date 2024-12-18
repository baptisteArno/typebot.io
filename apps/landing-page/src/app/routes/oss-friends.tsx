import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/oss-friends")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/oss-friends"!</div>;
}
