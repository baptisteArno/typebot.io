import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpc } from "@/lib/trpc";
import {
  Button,
  Flex,
  HStack,
  SlideFade,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { PackageIcon } from "./icons";

export const NewVersionPopup = () => {
  const { typebot, save } = useTypebot();
  const [isReloading, setIsReloading] = useState(false);
  const { data } = trpc.getAppVersionProcedure.useQuery();
  const [currentVersion, setCurrentVersion] = useState<string>();
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);

  useEffect(() => {
    if (!data?.commitSha) return;
    if (currentVersion === data.commitSha) return;
    setCurrentVersion(data.commitSha);
    if (currentVersion === undefined) return;
    setIsNewVersionAvailable(true);
  }, [data, currentVersion]);

  const saveAndReload = async () => {
    if (isReloading) return;
    setIsReloading(true);
    if (save) await save();
    window.location.reload();
  };

  return (
    <SlideFade
      in={isNewVersionAvailable}
      offsetY="20px"
      style={{
        position: "fixed",
        bottom: "18px",
        left: "18px",
        zIndex: 42,
      }}
      unmountOnExit
    >
      <Stack
        bgColor={useColorModeValue("white", "gray.900")}
        p="4"
        px="4"
        rounded="lg"
        shadow="md"
        borderWidth="1px"
        maxW="320px"
      >
        <HStack spacing={3}>
          <Stack spacing={4}>
            <Stack spacing={1}>
              <HStack>
                <PackageIcon />{" "}
                <Text fontWeight="medium">New version available!</Text>
              </HStack>

              <Text fontSize="sm">
                An improved version of Typebot is available. Please reload now
                to upgrade.
              </Text>
            </Stack>
            <Flex justifyContent="flex-end">
              <Button size="sm" onClick={saveAndReload}>
                {typebot?.id ? "Save and reload" : "Reload"}
              </Button>
            </Flex>
          </Stack>
        </HStack>
      </Stack>
    </SlideFade>
  );
};
