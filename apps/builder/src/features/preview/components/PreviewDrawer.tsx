import {
  Fade,
  Flex,
  HStack,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { reload } from "@typebot.io/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Cancel01Icon } from "@typebot.io/ui/icons/Cancel01Icon";
import { useDrag } from "@use-gesture/react";
import { useState } from "react";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { useRightPanel } from "@/hooks/useRightPanel";
import { headerHeight } from "../../editor/constants";
import { useTypebot } from "../../editor/providers/TypebotProvider";
import { runtimes } from "../data";
import { PreviewDrawerBody } from "./PreviewDrawerBody";
import { ResizeHandle } from "./ResizeHandle";
import { RuntimeMenu } from "./RuntimeMenu";

const preferredRuntimeKey = "preferredRuntime";

const getDefaultRuntime = (typebotId?: string) => {
  if (!typebotId) return runtimes[0];
  const preferredRuntime = localStorage.getItem(preferredRuntimeKey);
  return (
    runtimes.find((runtime) => runtime.name === preferredRuntime) ?? runtimes[0]
  );
};

export const PreviewDrawer = () => {
  const { typebot, save, isSavingLoading } = useTypebot();
  const { t } = useTranslate();
  const { setPreviewingBlock } = useGraph();
  const [width, setWidth] = useState(500);
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false);
  const [selectedRuntime, setSelectedRuntime] = useState<
    (typeof runtimes)[number]
  >(getDefaultRuntime(typebot?.id));
  const [, setRightPanel] = useRightPanel();

  const handleRestartClick = async () => {
    await save();
    reload();
  };

  const handleCloseClick = () => {
    setPreviewingBlock(undefined);
    setRightPanel(null);
  };

  const useResizeHandleDrag = useDrag(
    (state) => {
      setWidth(-state.offset[0]);
    },
    {
      from: () => [-width, 0],
    },
  );

  const setPreviewRuntimeAndSaveIntoLocalStorage = (
    runtime: (typeof runtimes)[number],
  ) => {
    setSelectedRuntime(runtime);
    localStorage.setItem(preferredRuntimeKey, runtime.name);
  };

  return (
    <Flex
      pos="absolute"
      right="0"
      top={`0`}
      h={`100%`}
      bgColor={useColorModeValue("white", "gray.950")}
      borderLeftWidth={"1px"}
      shadow="md"
      borderLeftRadius={"lg"}
      onMouseOver={() => setIsResizeHandleVisible(true)}
      onMouseLeave={() => setIsResizeHandleVisible(false)}
      p="6"
      zIndex={10}
      style={{ width: `${width}px` }}
    >
      <Fade in={isResizeHandleVisible}>
        <ResizeHandle
          {...useResizeHandleDrag()}
          pos="absolute"
          left="-7.5px"
          top={`calc(50% - ${headerHeight}px)`}
        />
      </Fade>

      <VStack w="full" spacing={4}>
        <HStack justifyContent={"space-between"} w="full">
          <HStack>
            <RuntimeMenu
              selectedRuntime={selectedRuntime}
              onSelectRuntime={setPreviewRuntimeAndSaveIntoLocalStorage}
            />
            {selectedRuntime.name === "Web" ? (
              <Button
                onClick={handleRestartClick}
                disabled={isSavingLoading}
                variant="ghost"
              >
                {t("preview.restartButton.label")}
              </Button>
            ) : null}
          </HStack>

          <Button onClick={handleCloseClick} variant="secondary" size="icon">
            <Cancel01Icon />
          </Button>
        </HStack>
        <PreviewDrawerBody runtime={selectedRuntime.name} />
      </VStack>
    </Flex>
  );
};
