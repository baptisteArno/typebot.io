import { CopyIcon, TrashIcon } from "@/components/icons";
import { headerHeight } from "@/features/editor/constants";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  Button,
  HStack,
  IconButton,
  useColorModeValue,
  useEventListener,
} from "@chakra-ui/react";
import { createId } from "@paralleldrive/cuid2";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import {
  extractVariableIdReferencesInObject,
  extractVariableIdsFromObject,
} from "@typebot.io/variables/extractVariablesFromObject";
import type { Variable } from "@typebot.io/variables/schemas";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { projectMouse } from "../helpers/projectMouse";
import { useGroupsStore } from "../hooks/useGroupsStore";
import type { Coordinates } from "../types";

type Props = {
  graphPosition: Coordinates & { scale: number };
  isReadOnly: boolean;
  focusedGroups: string[];
  blurGroups: () => void;
};

export const GroupSelectionMenu = ({
  graphPosition,
  isReadOnly,
  focusedGroups,
  blurGroups,
}: Props) => {
  const [mousePosition, setMousePosition] = useState<Coordinates>();
  const { typebot, deleteGroups, pasteGroups } = useTypebot();
  const ref = useRef<HTMLDivElement>(null);

  const groupsInClipboard = useGroupsStore(
    useShallow((state) => state.groupsInClipboard),
  );
  const { copyGroups, setFocusedGroups, updateGroupCoordinates } =
    useGroupsStore(
      useShallow((state) => ({
        copyGroups: state.copyGroups,
        updateGroupCoordinates: state.updateGroupCoordinates,
        setFocusedGroups: state.setFocusedGroups,
      })),
    );

  useEventListener("pointerup", (e) => e.stopPropagation(), ref.current);

  useEventListener("mousemove", (e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  });

  const handleCopy = () => {
    if (!typebot) return;
    const groups = typebot.groups.filter((g) => focusedGroups.includes(g.id));
    const edges = typebot.edges.filter((edge) =>
      groups.find((g) => g.id === edge.to.groupId),
    );
    const variables = extractVariablesFromCopiedGroups(
      groups,
      typebot.variables,
    );
    copyGroups({
      groups,
      edges,
      variables,
    });
    return {
      groups,
      edges,
      variables,
    };
  };

  const handleDelete = () => {
    deleteGroups(focusedGroups);
    blurGroups();
  };

  const handlePaste = (overrideClipBoard?: {
    groups: GroupV6[];
    edges: Edge[];
    variables: Omit<Variable, "value">[];
  }) => {
    if (!groupsInClipboard || isReadOnly || !mousePosition) return;
    const clipboard = overrideClipBoard ?? groupsInClipboard;
    const { groups, oldToNewIdsMapping } = parseGroupsToPaste(
      clipboard.groups,
      projectMouse(mousePosition, graphPosition),
    );
    groups.forEach((group) => {
      updateGroupCoordinates(group.id, group.graphCoordinates);
    });
    pasteGroups(
      groups,
      clipboard.edges,
      clipboard.variables,
      oldToNewIdsMapping,
    );
    setFocusedGroups(groups.map((g) => g.id));
  };

  useKeyboardShortcuts({
    copy: () => {
      handleCopy();
      toast("Groups copied to clipboard");
    },
    cut: () => {
      handleCopy();
      handleDelete();
    },
    duplicate: () => {
      const clipboard = handleCopy();
      handlePaste(clipboard);
    },
    backspace: handleDelete,
    paste: handlePaste,
  });

  return (
    <HStack
      ref={ref}
      rounded="md"
      spacing={0}
      pos="fixed"
      top={`calc(${headerHeight}px + 20px)`}
      bgColor={useColorModeValue("white", "gray.900")}
      zIndex={1}
      right="100px"
      shadow="lg"
    >
      <Button
        pointerEvents={"none"}
        color={useColorModeValue("blue.500", "blue.200")}
        borderRightWidth="1px"
        borderRightRadius="none"
        bgColor={useColorModeValue("white", undefined)}
        size="sm"
      >
        {focusedGroups.length} selected
      </Button>
      <IconButton
        borderRightWidth="1px"
        borderRightRadius="none"
        borderLeftRadius="none"
        aria-label="Copy"
        onClick={() => {
          handleCopy();
          toast("Groups copied to clipboard");
        }}
        bgColor={useColorModeValue("white", undefined)}
        icon={<CopyIcon />}
        size="sm"
      />

      <IconButton
        aria-label="Delete"
        borderLeftRadius="none"
        bgColor={useColorModeValue("white", undefined)}
        icon={<TrashIcon />}
        size="sm"
        onClick={handleDelete}
      />
    </HStack>
  );
};

const parseGroupsToPaste = (
  groups: GroupV6[],
  mousePosition: Coordinates,
): { groups: GroupV6[]; oldToNewIdsMapping: Map<string, string> } => {
  const farLeftGroup = groups.sort(
    (a, b) => a.graphCoordinates.x - b.graphCoordinates.x,
  )[0];
  const farLeftGroupCoord = farLeftGroup.graphCoordinates;

  const oldToNewIdsMapping = new Map<string, string>();
  const newGroups = groups.map((group) => {
    const newId = createId();
    oldToNewIdsMapping.set(group.id, newId);

    return {
      ...group,
      id: newId,
      graphCoordinates:
        group.id === farLeftGroup.id
          ? mousePosition
          : {
              x:
                mousePosition.x +
                group.graphCoordinates.x -
                farLeftGroupCoord.x,
              y:
                mousePosition.y +
                group.graphCoordinates.y -
                farLeftGroupCoord.y,
            },
    };
  });

  return {
    groups: newGroups,
    oldToNewIdsMapping,
  };
};

export const extractVariablesFromCopiedGroups = (
  groups: GroupV6[],
  existingVariables: Variable[],
): Omit<Variable, "value">[] => {
  const groupsStr = JSON.stringify(groups);
  if (!groupsStr) return [];
  const calledVariablesId = extractVariableIdReferencesInObject(
    groups,
    existingVariables,
  );
  const variableIdsInOptions = extractVariableIdsFromObject(groups);

  return [...variableIdsInOptions, ...calledVariablesId].reduce<
    Omit<Variable, "value">[]
  >((acc, id) => {
    if (!id) return acc;
    if (acc.find((v) => v.id === id)) return acc;
    const variable = existingVariables.find((v) => v.id === id);
    if (!variable) return acc;
    return [
      ...acc,
      {
        id: variable.id,
        name: variable.name,
        isSessionVariable: variable.isSessionVariable,
      },
    ];
  }, []);
};
