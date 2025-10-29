import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";

type Props = {
  variableId?: string;
};
export const TimeNodeContent = ({ variableId }: Props) => {
  return variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <p color={"gray.500"}>Pick a time</p>
  );
};
