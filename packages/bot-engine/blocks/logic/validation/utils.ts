/**
 * Shared validation utilities for CPF and CNPJ validation
 */

/**
 * Validates a CPF number according to Brazilian CPF validation algorithm
 * @param cpf The CPF string to validate (can be formatted or unformatted)
 * @returns true if the CPF is valid, false otherwise
 */
export function validateCpfNumber(cpf: string): boolean {
  // Remove formatação
  cpf = cpf.replace(/[^\d]/g, '')

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Calcula os dígitos verificadores
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  let digit1 = remainder >= 10 ? 0 : remainder

  if (parseInt(cpf.charAt(9)) !== digit1) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  let digit2 = remainder >= 10 ? 0 : remainder

  return parseInt(cpf.charAt(10)) === digit2
}

/**
 * Validates a CNPJ number according to Brazilian CNPJ validation algorithm
 * @param cnpj The CNPJ string to validate (can be formatted or unformatted)
 * @returns true if the CNPJ is valid, false otherwise
 */
export function validateCnpjNumber(cnpj: string): boolean {
  // Remove formatação
  cnpj = cnpj.replace(/[^\d]/g, '')

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  // Calcula o primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i]
  }
  let remainder = sum % 11
  let digit1 = remainder < 2 ? 0 : 11 - remainder

  if (parseInt(cnpj.charAt(12)) !== digit1) return false

  // Calcula o segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i]
  }
  remainder = sum % 11
  let digit2 = remainder < 2 ? 0 : 11 - remainder

  return parseInt(cnpj.charAt(13)) === digit2
}
