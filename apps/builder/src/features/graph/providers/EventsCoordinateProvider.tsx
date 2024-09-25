import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Coordinates, CoordinatesMap } from "../types";

const eventsCoordinatesContext = createContext<{
  eventsCoordinates: CoordinatesMap;
  updateEventCoordinates: (groupId: string, newCoord: Coordinates) => void;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({});

export const EventsCoordinatesProvider = ({
  children,
  events,
}: {
  children: ReactNode;
  events: TypebotV6["events"][number][];
  isReadOnly?: boolean;
}) => {
  const [eventsCoordinates, setEventsCoordinates] = useState<CoordinatesMap>(
    {},
  );

  useEffect(() => {
    setEventsCoordinates(
      events.reduce(
        (coords, group) => ({
          ...coords,
          [group.id]: group.graphCoordinates,
        }),
        {},
      ),
    );
  }, [events]);

  const updateEventCoordinates = useCallback(
    (groupId: string, newCoord: Coordinates) =>
      setEventsCoordinates((eventsCoordinates) => ({
        ...eventsCoordinates,
        [groupId]: newCoord,
      })),
    [],
  );

  return (
    <eventsCoordinatesContext.Provider
      value={{ eventsCoordinates, updateEventCoordinates }}
    >
      {children}
    </eventsCoordinatesContext.Provider>
  );
};

export const useEventsCoordinates = () => useContext(eventsCoordinatesContext);
