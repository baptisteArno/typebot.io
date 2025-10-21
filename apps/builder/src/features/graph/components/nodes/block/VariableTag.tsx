type Props = {
  variableName: string;
};

export const VariableTag = ({ variableName }: Props) => (
  <span className="bg-purple-9 text-white rounded-md py-0.5 px-1 break-all">
    {variableName}
  </span>
);
