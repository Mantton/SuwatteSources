import {
  DirectoryFilter,
  FilterType,
  Option,
  SortSelection,
} from "@suwatte/daisuke";
import { FilterObjectDto } from "../types";
import { Generate } from "./parser";

type InnerFilterObject = {
  [key: string]: any;
  name: string;
  state: any;
  values: string[];
  displayValues: string[];
  param: string;
};
export const parseFilter = (
  filter: FilterObjectDto,
  idx: number
): DirectoryFilter | DirectoryFilter[] => {
  const id = filter.filter.name.toLowerCase();
  switch (filter.type.toLowerCase()) {
    case "header": {
      return Generate<DirectoryFilter>({
        id,
        title: filter.filter.name,
        type: FilterType.INFO,
      });
    }
    case "separator": {
      return Generate<DirectoryFilter>({
        id,
        title: "",
        type: FilterType.INFO,
      });
    }
    case "select": {
      return ParseSelectComponent(idx, filter.filter);
    }
    case "text": {
      return Generate<DirectoryFilter>({
        id: idx.toString(),
        title: filter.filter.name,
        type: FilterType.TEXT,
      });
    }
    case "checkbox": {
      return ParseCheckBoxComponent(idx, filter.filter);
    }
    case "tristate": {
      return ParseTriStateComponent(idx, filter.filter);
    }

    case "group": {
      const items = filter.filter.state as FilterObjectDto[];

      const options: Option[] = items.map((item, index) => ({
        id: index.toString(),
        title: item.filter.name,
      }));

      const isTristateGroup = items.some((v) => v.type === "TriState");

      const prepared = Generate<DirectoryFilter>({
        id: idx.toString(),
        title: filter.filter.name,
        type: isTristateGroup
          ? FilterType.EXCLUDABLE_MULTISELECT
          : FilterType.MULTISELECT,
        options,
      });

      return prepared;
    }
    default:
      return [];
  }
};

const ParseSelectComponent = (idx: number, filter: any): DirectoryFilter => {
  let values = filter.displayValues as string[];
  return {
    id: idx.toString(), // The Index of the component in the List of filters
    title: filter.name,
    type: FilterType.SELECT,
    options: values.map((value, index) => ({
      id: index.toString(),
      title: value,
    })),
  };
};

const ParseCheckBoxComponent = (idx: number, filter: any): DirectoryFilter => {
  return {
    id: idx.toString(),
    title: filter.name,
    type: FilterType.TOGGLE,
  };
};

const ParseTriStateComponent = (idx: number, filter: any): DirectoryFilter => {
  return {
    id: idx.toString(),
    title: filter.name,
    type: FilterType.EXCLUDABLE_MULTISELECT,
    options: [
      {
        id: idx.toString(),
        title: filter.name,
      },
    ],
  };
};

export const ParseSortComponent = (filter: FilterObjectDto): Option[] => {
  return filter.filter.values.map((v, idx) => ({
    id: idx.toString(),
    title: v,
  }));
};
