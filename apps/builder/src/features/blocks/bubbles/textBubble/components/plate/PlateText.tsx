import { useTypebot } from "@/features/editor/providers/TypebotProvider";

export const PlateText = ({
  text,
  bold,
  italic,
  underline,
}: {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}) => {
  let className = "";
  if (bold) className += "slate-bold";
  if (italic) className += " slate-italic";
  if (underline) className += " slate-underline";
  if (className)
    return (
      <span className={className}>
        <PlateTextContent text={text} />
      </span>
    );
  return <PlateTextContent text={text} />;
};

const PlateTextContent = ({ text }: { text: string }) => {
  const { typebot } = useTypebot();

  return (
    <>
      {text.split(/\{\{=(.*?=\}\})/g).map((str, index) => {
        if (str.endsWith("=}}")) {
          return (
            <span
              className="slate-inline-code"
              // biome-ignore lint/suspicious/noArrayIndexKey: split output order is stable
              key={index}
            >
              {str.trim().slice(0, -3)}
            </span>
          );
        }
        return str.split(/\{\{(.*?\}\})/g).map((str, innerIndex) => {
          if (str.endsWith("}}")) {
            const variableName = str.trim().slice(0, -2);
            const matchingVariable = typebot?.variables.find(
              (variable) => variable.name === variableName,
            );
            if (!matchingVariable) return "{{" + str;
            return (
              <span
                className="bg-purple-9 text-white rounded-sm py-0.5 px-1.5"
                // biome-ignore lint/suspicious/noArrayIndexKey: split output order is stable
                key={innerIndex}
              >
                {str.trim().slice(0, -2)}
              </span>
            );
          }
          return str;
        });
      })}
    </>
  );
};
