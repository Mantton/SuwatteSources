export const dynamicSort = (property: string) => {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a: any, b: any) {
    const result =
      a[property] > b[property] ? -1 : a[property] < b[property] ? 1 : 0;
    return result * sortOrder;
  };
};

export const parseChapterString = (str: string) => {
  if (!str) throw new Error("Invalid Chapter String");
  let volume: number | undefined = parseInt(str[0]);

  if (Number.isNaN(volume)) throw new Error("Invalid Chapter Volume String");
  volume -= 1;
  if (volume == 0) volume = undefined;

  let number = parseInt(str.slice(1));
  if (Number.isNaN(number)) {
    throw new Error("Invalid Chapter Number String");
  }
  number = number / 10;
  return { volume, number };
};

export const prepareURLSuffix = (str: string): string => {
  const info = parseChapterString(str);
  const number = info.number;
  const volume = (info.volume ?? 0) + 1;

  let suffix = `-chapter-${number}`;
  if (volume != 1) {
    suffix += `-index-${volume}`;
  }
  suffix += ".html";
  return suffix;
};
