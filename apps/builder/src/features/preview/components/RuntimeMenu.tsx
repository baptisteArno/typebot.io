import { HStack, Tag, Text } from "@chakra-ui/react";
import { Menu } from "@typebot.io/ui/components/Menu";
import { ChevronDownIcon } from "@/components/icons";
import { runtimes } from "../data";

type Runtime = (typeof runtimes)[number];

type Props = {
  selectedRuntime: Runtime;
  onSelectRuntime: (runtime: Runtime) => void;
};

export const RuntimeMenu = ({ selectedRuntime, onSelectRuntime }: Props) => {
  return (
    <Menu.Root>
      <Menu.TriggerButton variant="secondary">
        <HStack justifyContent="space-between">
          {selectedRuntime.icon}
          <Text>{selectedRuntime.name}</Text>
          {"status" in selectedRuntime &&
          typeof selectedRuntime.status === "string" ? (
            <Tag colorScheme="orange">{selectedRuntime.status}</Tag>
          ) : null}
          <ChevronDownIcon />
        </HStack>
      </Menu.TriggerButton>
      <Menu.Popup>
        {runtimes
          .filter((runtime) => runtime.name !== selectedRuntime.name)
          .map((runtime) => (
            <Menu.Item
              key={runtime.name}
              onClick={() => onSelectRuntime(runtime)}
            >
              <HStack justifyContent="space-between">
                {runtime.icon}
                <Text>{runtime.name}</Text>
                {"status" in runtime && typeof runtime.status === "string" ? (
                  <Tag colorScheme="orange">{runtime.status}</Tag>
                ) : null}
              </HStack>
            </Menu.Item>
          ))}
      </Menu.Popup>
    </Menu.Root>
  );
};
