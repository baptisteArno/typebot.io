import { useRouter } from "next/router";

/**
 * Returns true if we are on the analytics page
 */
export const useIsAnalyzing = () => {
  const { pathname } = useRouter();

  return pathname.includes("/analytics");
};
