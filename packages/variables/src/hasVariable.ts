export const hasVariable = (str: string): boolean => /\{\{(.*?)\}\}/g.test(str);
