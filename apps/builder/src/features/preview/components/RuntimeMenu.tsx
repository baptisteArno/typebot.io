import { HStack, Text } from "@chakra-ui/react";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Menu } from "@typebot.io/ui/components/Menu";
import { ArrowDown01Icon } from "@typebot.io/ui/icons/ArrowDown01Icon";
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
            <Badge colorScheme="orange">{selectedRuntime.status}</Badge>
          ) : null}
          <ArrowDown01Icon />
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
                  <Badge colorScheme="orange">{runtime.status}</Badge>
                ) : null}
              </HStack>
            </Menu.Item>
          ))}
      </Menu.Popup>
    </Menu.Root>
  );
};
