import { useEventListener } from "@chakra-ui/react";
import { EventType } from "@typebot.io/events/constants";
import type { TDraggableEvent } from "@typebot.io/events/schemas";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import { Button } from "@typebot.io/ui/components/Button";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import {
  extractVariableIdReferencesInObject,
  extractVariableIdsFromObject,
} from "@typebot.io/variables/extractVariablesFromObject";
import type { Variable } from "@typebot.io/variables/schemas";
import { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { CopyIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "@/lib/toast";
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
      events: events as TDraggableEvent[],
      edges,
      variables,
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
    const farLeftElement = [...clipboard.groups, ...clipboard.events].sort(
      (a, b) => a.graphCoordinates.x - b.graphCoordinates.x,
    )[0];
    const { newGroups, oldToNewIdsMapping } = pasteGroups(clipboard, {
      newCoordinates: {
        mousePosition: projectMouse(mousePosition, graphPosition),
        farLeftElement: {
          id: farLeftElement.id,
          ...farLeftElement.graphCoordinates,
        },
      },
    });
    newGroups.forEach((group) => {
      updateElementCoordinates(group.id, group.graphCoordinates);
    });
    const { newEvents } = pasteEvents(clipboard, {
      oldToNewIdsMapping,
      updateCoordinates: {
        mousePosition: projectMouse(mousePosition, graphPosition),
        farLeftElement: {
          id: farLeftElement.id,
          ...farLeftElement.graphCoordinates,
        },
      },
    });
    newEvents.forEach((event) => {
      updateElementCoordinates(event.id, event.graphCoordinates);
    });

    setFocusedElements([...newGroups, ...newEvents].map((g) => g.id));
  };

  useKeyboardShortcuts({
    copy: () => {
      const clipboard = handleCopy();
      if (!clipboard) return;
      toast({ description: "Elements copied to clipboard", type: "info" });
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

  if (focusedElementIds.length === 0 || isReadOnly) return null;
  return (
    <div ref={ref} className="flex items-stretch gap-1">
      <span className="text-sm text-orange-10 font-medium px-2 inline-flex items-center select-none">
        {focusedElementIds.length} selected
      </span>
      <Button
        aria-label="Copy"
        onClick={() => {
          handleCopy();
          toast({ description: "Groups copied to clipboard", type: "info" });
        }}
        className="size-8"
        size="icon"
        variant="secondary"
      >
        <CopyIcon />
      </Button>

      <Button
        aria-label="Delete"
        className="size-8"
        size="icon"
        variant="secondary"
        onClick={handleDelete}
      >
        <TrashIcon />
      </Button>
    </div>
  );
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
