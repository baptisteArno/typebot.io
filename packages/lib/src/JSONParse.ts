// Taken from https://github.com/Ivan-Korolenko/json-with-bigint/blob/main/json-with-bigint.js

/* 
  Function to parse JSON
  If JSON has values presented in a lib's custom format (strings with digits and "n" character at the end), we just parse them to BigInt values (for backward compatibility with previous versions of the lib)
  If JSON has values greater than Number.MAX_SAFE_INTEGER, we convert those values to our custom format, then parse them to BigInt values.
  Other types of values are not affected and parsed as native JSON.parse() would parse them.

  Big numbers are found and marked using RegEx with these conditions:
    - Before the match there is ": OR ":[ OR ":[anyNumberOf(anyCharacters) with no \ before them
    - The match itself has more than 16 digits OR (16 digits and any digit of the number is greater than that of the Number.MAX_SAFE_INTEGER). And it may have a - sign at the start
    - After the match there is , OR } without " after it OR ] without " after it
*/
export const JSONParse = (json: string) => {
  const numbersBiggerThanMaxInt = /(?<!\\)":\s*(-?\d{17,})(?=[,\]}])/g;
  const serializedData = json.replace(numbersBiggerThanMaxInt, `"$1n"`);

  return JSON.parse(serializedData, (_, value) => {
    const isCustomFormatBigInt =
      typeof value === "string" && Boolean(value.match(/^-?\d+n$/));

    if (isCustomFormatBigInt)
      return BigInt(value.substring(0, value.length - 1));

    return value;
  });
};
