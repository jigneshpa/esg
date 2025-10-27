import { GroupBase, OptionsOrGroups } from "react-select";

export type OptionType = { value: number; label: string};

export type LoadOptionsFunction = (
	search: string,
	loadedOptions: OptionsOrGroups<OptionType, GroupBase<OptionType>>,
	{ page }?: { page?: number }
  ) => Promise<{
	options: OptionType[];
	hasMore: boolean;
	additional: { page: number };
}>
