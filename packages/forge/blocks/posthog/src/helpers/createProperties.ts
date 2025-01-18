export const createProperties = (
  properties: { key?: string; value?: string }[],
) => {
  const _properties: Record<string, any> = {};

  properties.forEach(({ key, value }) => {
    if (!key || !value) return;
    _properties[key] = value;
  });

  return _properties;
};
