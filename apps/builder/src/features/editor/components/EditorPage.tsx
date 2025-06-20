import { Seo } from "@/components/Seo";
import { Graph } from "@/features/graph/components/Graph";
import { GraphDndProvider } from "@/features/graph/providers/GraphDndProvider";
import { GraphProvider } from "@/features/graph/providers/GraphProvider";
import { VideoOnboardingFloatingWindow } from "@/features/onboarding/components/VideoOnboardingFloatingWindow";
import { PreviewDrawer } from "@/features/preview/components/PreviewDrawer";
import { VariablesDrawer } from "@/features/preview/components/VariablesDrawer";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useRightPanel } from "@/hooks/useRightPanel";
import { Flex, Spinner, useColorModeValue } from "@chakra-ui/react";
import { EditorProvider } from "../providers/EditorProvider";
import { useTypebot } from "../providers/TypebotProvider";
import { BlocksSideBar } from "./BlocksSideBar";
import { BoardMenuButton } from "./BoardMenuButton";
import { SuspectedTypebotBanner } from "./SuspectedTypebotBanner";
import { TypebotHeader } from "./TypebotHeader";

export const EditorPage = () => {
  const { typebot, currentUserMode } = useTypebot();
  const { workspace } = useWorkspace();
  const backgroundImage = useColorModeValue(
    "radial-gradient(var(--chakra-colors-gray-300), 1px, transparent 0)",
    "radial-gradient(#2f2f39 1px, transparent 0)",
  );
  const bgColor = useColorModeValue("gray.100", "gray.900");

  const isSuspicious = typebot?.riskLevel === 100 && !workspace?.isVerified;

  return (
    <EditorProvider>
      <Seo title={typebot?.name ? `${typebot.name} | Editor` : "Editor"} />
      <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
        <VideoOnboardingFloatingWindow type="editor" />
        {isSuspicious && <SuspectedTypebotBanner typebotId={typebot.id} />}
        <TypebotHeader />
        <Flex
          flex="1"
          pos="relative"
          overflow="clip"
          h="full"
          bgColor={bgColor}
          backgroundImage={backgroundImage}
          backgroundSize="40px 40px"
          backgroundPosition="-19px -19px"
        >
          {typebot ? (
            <GraphDndProvider>
              <GraphProvider
                isReadOnly={
                  currentUserMode === "read" || currentUserMode === "guest"
                }
              >
                <Graph flex="1" typebot={typebot} key={typebot.id} />
                <BoardMenuButton
                  pos="absolute"
                  right="40px"
                  top={`calc(20px + ${isSuspicious ? "70px" : "0px"})`}
                />
                <RightPanel />
              </GraphProvider>
              {currentUserMode === "write" && <BlocksSideBar />}
            </GraphDndProvider>
          ) : (
            <Flex justify="center" align="center" boxSize="full">
              <Spinner color="gray" />
            </Flex>
          )}
        </Flex>
      </Flex>
    </EditorProvider>
  );
};

const RightPanel = () => {
  const [rightPanel, setRightPanel] = useRightPanel();

  switch (rightPanel) {
    case "preview":
      return <PreviewDrawer />;
    case "variables":
      return <VariablesDrawer onClose={() => setRightPanel(null)} />;
    case null:
      return null;
  }
};
