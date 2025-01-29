export const parseProperties = (
  properties: { key?: string; value?: string }[] | undefined,
  isAnonymous?: boolean,
) => {
  if (!properties) return;
  const parsedProperties: Record<string, any> = {};

  properties.forEach(({ key, value }) => {
    if (!key || !value) return;
    parsedProperties[key] = value;
  });

  if (isAnonymous) parsedProperties["$process_person_profile"] = false;

  return parsedProperties;
};
