import {
  BooleanState,
  CGSize,
  ContentSource,
  ImageRedrawHandler,
  PageLink,
  PageLinkResolver,
  PageSection,
  RedrawWithSizeCommand,
  ResolvedPageSection,
  RunnerInfo,
  SourceConfig,
} from "@suwatte/daisuke";
import { TachiBuilder, TachiParsedHttpSource } from "../../template/tachiyomi";
import { MangaReaderTemplate } from "../../template/mangareader";
import { redraw } from "./redraw";
import { getHomepage } from "./homepage";

const INFO: RunnerInfo = {
  id: "mangareader_to",
  name: "MangaReader",
  thumbnail: "mangareader.png",
  version: 0.1,
};

export class Target
  extends TachiBuilder
  implements ContentSource, ImageRedrawHandler, PageLinkResolver
{
  constructor() {
    super(INFO, MangaReaderTemplate);
  }

  config?: SourceConfig | undefined = {
    disableChapterDataCaching: true,
    disableChapterDates: true,
  };

  // * Image Redraw Handler
  async shouldRedrawImage(url: string): Promise<BooleanState> {
    const state = url.includes("#scrambled");
    return { state };
  }

  async redrawImageWithSize(size: CGSize): Promise<RedrawWithSizeCommand> {
    return redraw(size);
  }

  // * Page Link Resolver
  async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
    if (link.id !== "home") throw new Error("page not found.");
    if (!(this.source instanceof TachiParsedHttpSource))
      throw new Error("Invalid Config");
    return getHomepage(this.source);
  }
  async resolvePageSection(
    _: PageLink,
    __: string
  ): Promise<ResolvedPageSection> {
    throw new Error("Method not used.");
  }
}
