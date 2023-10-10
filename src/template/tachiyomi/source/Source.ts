import { Chapter, Content } from "@suwatte/daisuke";
import { ChapterRecognition } from "../ChapterRecognition";

export abstract class TachiSource {
  abstract readonly name: string;
  readonly recognizer = new ChapterRecognition();

  abstract getMangaDetails(id: string): Promise<Content>;
  abstract getMangaChapters(id: string): Promise<Chapter[]>;

  getUrlWithoutDomain(orig: string) {
    try {
      const encodedOrig = orig.replace(" ", "%20");
      const uriPattern = /^https?:\/\/[^/]+(\/[^?]*)?(\?[^#]*)?(#.*)?/;
      const matches = encodedOrig.match(uriPattern);
      if (matches) {
        let out = matches[1] || "";
        if (matches[2]) {
          out += matches[2];
        }
        if (matches[3]) {
          out += matches[3];
        }
        return out;
      } else {
        throw new Error("Invalid URL");
      }
    } catch (e) {
      return orig;
    }
  }
}
