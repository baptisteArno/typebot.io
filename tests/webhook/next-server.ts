export { NextRequest, NextResponse } from "next/server.js";
// The loopback server has no Next request scope; execute post-response work locally.
export const after = (task: () => unknown) => {
  void Promise.resolve().then(task).catch(console.error);
};
