// import { FormLabel, Stack } from '@chakra-ui/react'
// import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
// import { Input } from 'components/shared/Textbox'
// import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
// import { TextInputOptions, Variable } from 'models'
// import React from 'react'

// type TextInputSettingsBodyProps = {
//   options: TextInputOptions
//   onOptionsChange: (options: TextInputOptions) => void
// }

// export const TextInputSettingsBody = ({
//   options,
//   onOptionsChange,
// }: TextInputSettingsBodyProps) => {
//   const handleVariableChange = (variable: Variable) => {
//     if(variable){
//       onOptionsChange({
//         ...options, variableId: variable?.id, property: {
//           domain: "CHAT",
//           name: variable.name,
//           type: variable.type ? variable.type : "string",
//           token: variable.token
//         }
//       })
//     } else {
//       onOptionsChange({
//         ...options, variableId: variable.id
//       })
//     }
//   }

//   return (
//     <Stack spacing={4}>
//       <Stack>
//         <VariableSearchInput
//           initialVariableId={options.variableId}
//           onSelectVariable={handleVariableChange}
//         />
//       </Stack>
//     </Stack>
//   )
// }
