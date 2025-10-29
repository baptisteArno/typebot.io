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
        <div className="flex items-center gap-2 justify-between">
          {selectedRuntime.icon}
          <p>{selectedRuntime.name}</p>
          {"status" in selectedRuntime &&
          typeof selectedRuntime.status === "string" ? (
            <Badge colorScheme="orange">{selectedRuntime.status}</Badge>
          ) : null}
          <ArrowDown01Icon />
        </div>
      </Menu.TriggerButton>
      <Menu.Popup>
        {runtimes
          .filter((runtime) => runtime.name !== selectedRuntime.name)
          .map((runtime) => (
            <Menu.Item
              key={runtime.name}
              onClick={() => onSelectRuntime(runtime)}
            >
              <div className="flex items-center gap-2 justify-between">
                {runtime.icon}
                <p>{runtime.name}</p>
                {"status" in runtime && typeof runtime.status === "string" ? (
                  <Badge colorScheme="orange">{runtime.status}</Badge>
                ) : null}
              </div>
            </Menu.Item>
          ))}
      </Menu.Popup>
    </Menu.Root>
  );
};
