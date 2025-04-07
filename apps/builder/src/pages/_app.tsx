import { SupportBubble } from "@/components/SupportBubble";
import { TypebotProvider } from "@/features/editor/providers/TypebotProvider";
import { UserProvider } from "@/features/user/UserProvider";
import { WorkspaceProvider } from "@/features/workspace/WorkspaceProvider";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { useRouterProgressBar } from "@/lib/routerProgressBar";
import { tolgee } from "@/lib/tolgee";
import { trpc } from "@/lib/trpc";
import { ChakraProvider, createStandaloneToast } from "@chakra-ui/react";
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
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { Toaster } from "sonner";

const { ToastContainer, toast } = createStandaloneToast(customTheme);

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
        position: "top-right",
        status: "success",
        title: "Upgrade success!",
        description: `Workspace upgraded to ${toTitleCase(newPlan)} 🎉`,
      });
  }, [router.query.stripe]);

  const typebotId = router.query.typebotId?.toString();

  return (
    <TolgeeProvider tolgee={ssrTolgee}>
      <NuqsAdapter>
        <ToastContainer />
        <ChakraProvider theme={customTheme}>
          <Toaster offset={24} position="top-right" />
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
        </ChakraProvider>
      </NuqsAdapter>
    </TolgeeProvider>
  );
};

export default trpc.withTRPC(App);
