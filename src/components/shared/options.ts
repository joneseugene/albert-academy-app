/** Option shape shared by SelectInput, MultiSelect and filters. */
export type Option = {
  value: string;
  label: string;
  description?: string;
  /** Options with the same group render under one heading. */
  group?: string;
  disabled?: boolean;
};

export function groupOptions(
  options: Option[],
): Array<{ group: string | undefined; options: Option[] }> {
  const groups = new Map<string | undefined, Option[]>();
  for (const option of options) {
    const list = groups.get(option.group) ?? [];
    list.push(option);
    groups.set(option.group, list);
  }
  return [...groups].map(([group, opts]) => ({ group, options: opts }));
}
