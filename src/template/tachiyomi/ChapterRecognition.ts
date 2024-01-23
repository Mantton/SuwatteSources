export class ChapterRecognition {
  private readonly NUMBER_PATTERN: string = "([0-9]+)(\\.[0-9]+)?(\\.?[a-z]+)?";
  private basic = new RegExp(`(ch\\.) *${this.NUMBER_PATTERN}`, "i");
  private number = new RegExp(this.NUMBER_PATTERN);
  private preview = /preview/i;
  private unwanted = /\b(?:v|ver|vol|version|volume|season|s)[^a-z]?[0-9]+/;
  private unwantedWhiteSpace = /\s(?=extra|special|omake)/;

  parseChapterNumber(
    mangaTitle: string,
    chapterName: string,
    chapterNumber?: number
  ): number {
    if (
      chapterNumber !== undefined &&
      (chapterNumber === -2.0 || chapterNumber > -1.0)
    ) {
      return chapterNumber;
    }

    let name: string = chapterName.toLowerCase();
    name = name.replace(mangaTitle.toLowerCase(), "").trim();
    name = name.replace(",", ".").replace("-", ".");
    name = name.replace(this.unwantedWhiteSpace, "");
    name = name.replace(this.unwanted, "");

    const basicMatch = name.match(this.basic);
    if (basicMatch && basicMatch[1].toLowerCase() === "ch.") {
      // Ensure the prefix is 'ch.'
      return this.getChapterNumberFromMatch(basicMatch, true);
    }

    const numberMatch = name.match(this.number);
    if (numberMatch) {
      return this.getChapterNumberFromMatch(numberMatch);
    }

    const previewMatch = name.match(this.preview);
    if (previewMatch) {
      return 0;
    }

    return chapterNumber !== undefined
      ? chapterNumber
      : Math.round(Math.random() * 100) / 100;
  }

  private getChapterNumberFromMatch(
    match: RegExpMatchArray,
    isBasicMatch?: boolean
  ): number {
    const offset = isBasicMatch ? 1 : 0;
    const initial: number = parseFloat(match[1 + offset]);
    const subChapterDecimal: string = match[2 + offset];
    const subChapterAlpha: string = match[3 + offset];
    const addition: number = this.checkForDecimal(
      subChapterDecimal,
      subChapterAlpha
    );
    return initial + addition;
  }

  private checkForDecimal(decimal?: string, alpha?: string): number {
    if (decimal) {
      return parseFloat(decimal);
    }

    if (alpha) {
      if (alpha.includes("extra")) {
        return 0.99;
      }

      if (alpha.includes("omake")) {
        return 0.98;
      }

      if (alpha.includes("special")) {
        return 0.97;
      }

      const trimmedAlpha: string = alpha.startsWith(".")
        ? alpha.slice(1)
        : alpha;
      if (trimmedAlpha.length === 1) {
        return this.parseAlphaPostFix(trimmedAlpha);
      }
    }

    return 0.0;
  }

  private parseAlphaPostFix(alpha: string): number {
    const number: number = alpha.charCodeAt(0) - ("a".charCodeAt(0) - 1);
    if (number >= 10) return 0.0;
    return number / 10.0;
  }
}
