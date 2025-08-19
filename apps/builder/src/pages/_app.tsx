import { SupportBubble } from "@/components/SupportBubble";
import { TypebotProvider } from "@/features/editor/providers/TypebotProvider";
import { UserProvider } from "@/features/user/UserProvider";
import { WorkspaceProvider } from "@/features/workspace/WorkspaceProvider";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { useRouterProgressBar } from "@/lib/routerProgressBar";
import { tolgee } from "@/lib/tolgee";
import { ChakraProvider } from "@chakra-ui/react";
import { TolgeeProvider, useTolgeeSSR } from "@tolgee/react";
import { toTitleCase } from "@typebot.io/lib/utils";
import { Plan } from "@typebot.io/prisma/enum";
import { customTheme } from "@typebot.io/ui/chakraTheme";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import "@/assets/styles/routerProgressBar.css";
import "@/assets/styles/plate.css";
import "@/assets/styles/resultsTable.css";
import "@/assets/styles/custom.css";
import "@/assets/styles/globals.css";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { queryClient } from "@/lib/queryClient";
import { toast, toastManager } from "@/lib/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toast, ToastProvider } from "@typebot.io/ui/components/Toast";
import { TooltipProvider } from "@typebot.io/ui/components/Tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const ssrTolgee = useTolgeeSSR(tolgee, router.locale);

  useRouterProgressBar();

  useEffect(() => {
    if (
      router.pathname.endsWith("/edit") ||
      router.pathname.endsWith("/analytics")
    ) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("disable-scroll-x-behavior");
    } else {
      document.body.style.overflow = "auto";
      document.body.classList.remove("disable-scroll-x-behavior");
    }
  }, [router.pathname]);

  useEffect(() => {
    const newPlan = router.query.stripe?.toString();
    if (newPlan === Plan.STARTER || newPlan === Plan.PRO)
      toast({
        type: "success",
        title: "Upgrade success!",
        description: `Workspace upgraded to ${toTitleCase(newPlan)} 🎉`,
      });
  }, [router.query.stripe]);

  const typebotId = router.query.typebotId?.toString();

  return (
    <TolgeeProvider tolgee={ssrTolgee}>
      <NuqsAdapter>
        <ChakraProvider theme={customTheme}>
          <TooltipProvider>
            <QueryClientProvider client={queryClient}>
              <SessionProvider session={pageProps.session}>
                <UserProvider>
                  <TypebotProvider typebotId={typebotId}>
                    <WorkspaceProvider typebotId={typebotId}>
                      <Component {...pageProps} />
                      {!router.pathname.endsWith("edit") &&
                        isCloudProdInstance() && <SupportBubble />}
                    </WorkspaceProvider>
                  </TypebotProvider>
                </UserProvider>
              </SessionProvider>
            </QueryClientProvider>
            <ToastProvider toastManager={toastManager}>
              <Toast.List CodeEditor={CodeEditor} />
            </ToastProvider>
          </TooltipProvider>
        </ChakraProvider>
      </NuqsAdapter>
    </TolgeeProvider>
  );
};

export default App;
