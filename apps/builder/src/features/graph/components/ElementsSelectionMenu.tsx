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
import { EventType } from "@typebot.io/events/constants";
import type { TDraggableEvent } from "@typebot.io/events/schemas";
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
import { useSelectionStore } from "../hooks/useSelectionStore";
import type { Coordinates } from "../types";

type Props = {
  graphPosition: Coordinates & { scale: number };
  isReadOnly: boolean;
  focusedElementIds: string[];
  blurElements: () => void;
};

export const ElementsSelectionMenu = ({
  graphPosition,
  isReadOnly,
  focusedElementIds,
  blurElements,
}: Props) => {
  const [mousePosition, setMousePosition] = useState<Coordinates>();
  const { typebot, deleteGroups, pasteGroups, pasteEvents, deleteEvents } =
    useTypebot();
  const ref = useRef<HTMLDivElement>(null);

  const groupsInClipboard = useSelectionStore(
    useShallow((state) => state.elementsInClipboard),
  );
  const { copyElements, setFocusedElements, updateElementCoordinates } =
    useSelectionStore(
      useShallow((state) => ({
        copyElements: state.copyElements,
        updateElementCoordinates: state.updateElementCoordinates,
        setFocusedElements: state.setFocusedElements,
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
    const groups = typebot.groups.filter((g) =>
      focusedElementIds.includes(g.id),
    );
    const events = typebot.events.filter(
      (event) =>
        focusedElementIds.includes(event.id) && event.type !== EventType.START,
    );
    if (events.length === 0 && groups.length === 0) return;
    const edges = typebot.edges.filter((edge) =>
      groups.find((g) => g.id === edge.to.groupId),
    );
    const variables = extractVariablesFromCopiedElements(
      [...groups, ...events] as (GroupV6 | TDraggableEvent)[],
      typebot.variables,
    );
    const elements = {
      groups,
      edges,
      variables,
      events: events as TDraggableEvent[],
    };
    copyElements(elements);
    return elements;
  };

  const handleDelete = () => {
    deleteGroups(focusedElementIds);
    deleteEvents(focusedElementIds);
    blurElements();
  };

  const handlePaste = (overrideClipBoard?: {
    groups: GroupV6[];
    edges: Edge[];
    variables: Omit<Variable, "value">[];
    events: TDraggableEvent[];
  }) => {
    if (!groupsInClipboard || isReadOnly || !mousePosition) return;
    const clipboard = overrideClipBoard ?? groupsInClipboard;
    const { groups, events, oldToNewIdsMapping } = parseElementsToPaste({
      groups: clipboard.groups,
      events: clipboard.events,
      mousePosition: projectMouse(mousePosition, graphPosition),
    });
    groups.forEach((group) => {
      updateElementCoordinates(group.id, group.graphCoordinates);
    });
    events.forEach((event) => {
      updateElementCoordinates(event.id, event.graphCoordinates);
    });
    pasteEvents(events, clipboard.edges, oldToNewIdsMapping);
    pasteGroups(
      groups,
      clipboard.edges,
      clipboard.variables,
      oldToNewIdsMapping,
    );
    setFocusedElements([...groups, ...events].map((g) => g.id));
  };

  useKeyboardShortcuts({
    copy: () => {
      const clipboard = handleCopy();
      if (!clipboard) return;
      toast("Elements copied to clipboard");
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
    selectAll: () => {
      if (!typebot) return;
      setFocusedElements(
        typebot.groups
          .map((g) => g.id)
          .concat(typebot.events.map((e) => e.id)) ?? [],
      );
    },
  });

  return (
    <HStack
      ref={ref}
      rounded="md"
      spacing={0}
      pos="fixed"
      top={`calc(${headerHeight}px + 20px)`}
      bgColor={useColorModeValue("white", "gray.950")}
      zIndex={1}
      right="100px"
      shadow="md"
    >
      <Button
        pointerEvents={"none"}
        color={useColorModeValue("orange.500", "orange.200")}
        borderRightWidth="1px"
        borderRightRadius="none"
        bgColor={useColorModeValue("white", undefined)}
        size="sm"
      >
        {focusedElementIds.length} selected
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

const parseElementsToPaste = ({
  groups,
  events,
  mousePosition,
}: {
  groups: GroupV6[];
  events: TDraggableEvent[];
  mousePosition: Coordinates;
}): {
  groups: GroupV6[];
  events: TDraggableEvent[];
  oldToNewIdsMapping: Map<string, string>;
} => {
  const farLeftElement = [...groups, ...events].sort(
    (a, b) => a.graphCoordinates.x - b.graphCoordinates.x,
  )[0];
  const farLeftElementCoord = farLeftElement.graphCoordinates;

  const oldToNewIdsMapping = new Map<string, string>();
  const newGroups = groups.map((group) => {
    const newId = createId();
    oldToNewIdsMapping.set(group.id, newId);

    return {
      ...group,
      id: newId,
      graphCoordinates:
        group.id === farLeftElement.id
          ? mousePosition
          : {
              x:
                mousePosition.x +
                group.graphCoordinates.x -
                farLeftElementCoord.x,
              y:
                mousePosition.y +
                group.graphCoordinates.y -
                farLeftElementCoord.y,
            },
    };
  });

  const newEvents = events.map((event) => {
    const newId = createId();
    oldToNewIdsMapping.set(event.id, newId);

    return {
      ...event,
      id: newId,
      graphCoordinates:
        event.id === farLeftElement.id
          ? mousePosition
          : {
              x:
                mousePosition.x +
                event.graphCoordinates.x -
                farLeftElementCoord.x,
              y:
                mousePosition.y +
                event.graphCoordinates.y -
                farLeftElementCoord.y,
            },
    };
  });

  return {
    groups: newGroups,
    events: newEvents,
    oldToNewIdsMapping,
  };
};

export const extractVariablesFromCopiedElements = (
  elements: (GroupV6 | TDraggableEvent)[],
  existingVariables: Variable[],
): Omit<Variable, "value">[] => {
  const elementsStr = JSON.stringify(elements);
  if (!elementsStr) return [];
  const calledVariablesId = extractVariableIdReferencesInObject(
    elements,
    existingVariables,
  );
  const variableIdsInOptions = extractVariableIdsFromObject(elements);

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
