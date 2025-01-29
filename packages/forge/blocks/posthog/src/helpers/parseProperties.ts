export const parseProperties = ({
  properties,
  personProperties,
  isAnonymous,
}: {
  properties: { key?: string; value?: string }[] | undefined;
  personProperties?: { key?: string; value?: string }[];
  isAnonymous?: boolean;
}) => {
  if (!properties) return;
  const parsedProperties: Record<string, string | boolean> & {
    $set?: Record<string, string>;
  } = {};

  properties.forEach(({ key, value }) => {
    if (!key || !value) return;
    parsedProperties[key] = value;
  });

  if (isAnonymous) parsedProperties["$process_person_profile"] = false;
  else if (personProperties) {
    const set: Record<string, string> = {};
    personProperties.forEach(({ key, value }) => {
      if (!key || !value) return;
      set[key] = value;
    });
    parsedProperties["$set"] = set;
  }

  return parsedProperties;
};
