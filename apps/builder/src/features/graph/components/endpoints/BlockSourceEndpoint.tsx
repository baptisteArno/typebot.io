import {
  type BoxProps,
  Flex,
  useColorModeValue,
  useEventListener,
} from "@chakra-ui/react";
import type { BlockSource } from "@typebot.io/typebot/schemas/edge";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEndpoints } from "../../providers/EndpointsProvider";
import { useGraph } from "../../providers/GraphProvider";

const endpointHeight = 32;

export const BlockSourceEndpoint = ({
  source,
  groupId,
  isHidden,
  ...props
}: BoxProps & {
  source: BlockSource;
  groupId: string;
  isHidden?: boolean;
}) => {
  const id = source.itemId ?? source.blockId;
  const color = useColorModeValue("blue.200", "blue.100");
  const connectedColor = useColorModeValue("blue.300", "blue.200");
  const bg = useColorModeValue("gray.100", "gray.700");
  const { setConnectingIds, previewingEdge, graphPosition } = useGraph();
  const { setSourceEndpointYOffset, deleteSourceEndpointYOffset } =
    useEndpoints();
  const ref = useRef<HTMLDivElement | null>(null);
  const [groupHeight, setGroupHeight] = useState<number>();
  const [groupTransformProp, setGroupTransformProp] = useState<string>();

  const endpointY = useMemo(
    () =>
      ref.current
        ? Number(
            (
              (ref.current?.getBoundingClientRect().y +
                (endpointHeight * graphPosition.scale) / 2 -
                graphPosition.y) /
              graphPosition.scale
            ).toFixed(2),
          )
        : undefined,
    // We need to force recompute whenever the group height and position changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graphPosition.scale, graphPosition.y, groupHeight, groupTransformProp],
  );

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setGroupHeight(entries[0].contentRect.height);
    });
    const groupElement = document.getElementById(`group-${groupId}`);
    if (!groupElement) return;
    resizeObserver.observe(groupElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [groupId]);

  useLayoutEffect(() => {
    const mutationObserver = new MutationObserver((entries) => {
      setGroupTransformProp((entries[0].target as HTMLElement).style.transform);
    });
    const groupElement = document.getElementById(`group-${groupId}`);
    if (!groupElement) return;
    mutationObserver.observe(groupElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => {
      mutationObserver.disconnect();
    };
  }, [groupId]);

  useEffect(() => {
    if (!endpointY) return;
    setSourceEndpointYOffset?.({
      id,
      y: endpointY,
    });
  }, [setSourceEndpointYOffset, endpointY, id]);

  useEffect(
    () => () => {
      deleteSourceEndpointYOffset?.(id);
    },
    [deleteSourceEndpointYOffset, id],
  );

  useEventListener(
    "pointerdown",
    (e) => {
      e.stopPropagation();
      if (groupId) setConnectingIds({ source: { ...source, groupId } });
    },
    ref.current,
  );

  useEventListener(
    "mousedown",
    (e) => {
      e.stopPropagation();
    },
    ref.current,
  );

  return (
    <Flex
      ref={ref}
      data-testid="endpoint"
      boxSize="32px"
      rounded="full"
      cursor="copy"
      justify="center"
      align="center"
      pointerEvents="all"
      visibility={isHidden ? "hidden" : "visible"}
      {...props}
    >
      <Flex
        boxSize="20px"
        justify="center"
        align="center"
        bg={bg}
        rounded="full"
      >
        <Flex
          boxSize="13px"
          rounded="full"
          borderWidth="3.5px"
          shadow={`sm`}
          borderColor={
            previewingEdge &&
            "blockId" in previewingEdge.from &&
            previewingEdge.from.blockId === source.blockId &&
            previewingEdge.from.itemId === source.itemId
              ? connectedColor
              : color
          }
        />
      </Flex>
    </Flex>
  );
};
