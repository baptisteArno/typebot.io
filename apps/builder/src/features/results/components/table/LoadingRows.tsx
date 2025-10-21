import { Checkbox, Flex, Skeleton } from "@chakra-ui/react";

type LoadingRowsProps = {
  totalColumns: number;
};

export const LoadingRows = ({ totalColumns }: LoadingRowsProps) => {
  return (
    <>
      {Array.from(Array(3)).map((_, idx) => (
        <tr key={idx}>
          <td className="px-2 py-2 border border-gray-6 w-10">
            <Flex ml="1">
              <Checkbox isDisabled />
            </Flex>
          </td>
          {Array.from(Array(totalColumns)).map((_, idx) => {
            return (
              <td className="px-4 py-2 border border-gray-6 w-full" key={idx}>
                <Skeleton height="5px" w="full" />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};
