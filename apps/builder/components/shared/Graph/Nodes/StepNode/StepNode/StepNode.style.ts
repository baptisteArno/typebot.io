import styled from 'styled-components';

interface PropsBlockStack {
  isOpened: boolean;
  isPreviewing: boolean;
}

export const BlockStack = styled.div<PropsBlockStack>`
  width: 278px;
  display: flex; 
  background-color: #F4F4F5;
  border: 1px solid #E3E4E8;
  padding: 8px;
  border-radius: 8px;
  align-items: flex-start;
  cursor: pointer;
  margin: ${p => (p.isOpened ? "-1px" : "0")};
`;

// flex="1"
// spacing={1}
// userSelect="none"
// p="3"
// borderWidth={isOpened || isPreviewing ? '2px' : '1px'}
// borderColor={isOpened || isPreviewing ? 'blue.400' : 'gray.200'}
// margin={isOpened || isPreviewing ? '-1px' : 0}
// rounded="lg"
// cursor={'pointer'}
// bgColor="gray.50"
// align="center"
// w="full"
// transition="border-color 0.2s"