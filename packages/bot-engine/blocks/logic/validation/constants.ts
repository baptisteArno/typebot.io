/**
 * Constantes globais para nomes de variáveis de validação
 */
export const VALIDATION_RESULT_VARIABLES = {
  CPF: 'cpf_valido',
  CNPJ: 'cnpj_valido',
} as const

export type ValidationResultVariable =
  (typeof VALIDATION_RESULT_VARIABLES)[keyof typeof VALIDATION_RESULT_VARIABLES]
