// Copied from https://github.com/sergiodxa/remix-utils/blob/main/src/react/use-hydrated.ts

import { useHydrated } from "@/hooks/useHydrated";
import { type ReactNode, Suspense } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export const ClientOnly = ({ children, fallback = null }: Props) => (
  <Suspense fallback={fallback}>{useHydrated() ? children : fallback}</Suspense>
);
