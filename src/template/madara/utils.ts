import {
  DirectoryRequest,
  NetworkRequest,
  PublicationStatus,
} from "@suwatte/daisuke";
import { Cheerio, CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";
import moment from "moment";
import {
  CANCELLED_STATUS_LIST,
  COMPLETED_STATUS_LIST,
  DAY_DATE_LIST,
  HIATUS_STATUS_LIST,
  HOUR_DATE_LIST,
  MINUTE_DATE_LIST,
  MONTH_DATE_LIST,
  ONGOING_STATUS_LIST,
  SECONDS_DATE_LIST,
  WEEK_DATE_LIST,
  YEAR_DATE_LIST,
} from "./constants";
import { AnchorTag, Context } from "./types";

export const AJAXDirectoryRequest = (
  ctx: Context,
  request: DirectoryRequest,
  searching = false
): NetworkRequest => {
  const body = generateAJAXRequest(ctx, request);
  if (!searching) {
    body["template"] = "madara-core/content/content-archive";
  }
  return {
    url: `${ctx.baseUrl}/wp-admin/admin-ajax.php`,
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      referer: ctx.baseUrl + "/",
    },
    body,
  };
};
const generateAJAXRequest = (
  ctx: Context,
  request: DirectoryRequest
): Record<string, string> => {
  const body: Record<string, string> = {
    action: "madara_load_more",
    page: ((request.page ?? 1) - 1).toString(),
    template: "madara-core/content/content-search",
    "vars[paged]": "1",
    "vars[template]": "archive",
    "vars[sidebar]": "right",
    "vars[post_type]": "wp-manga",
    "vars[post_status]": "publish",
    "vars[manga_archives_item_layout]": "big_thumbnail",
    "vars[posts_per_page]": "30",
  };

  if (ctx.filterNonMangaItems && ctx.showOnlyManga) {
    body["vars[meta_query][0][key]"] = "_wp_manga_chapter_type";
    body["vars[meta_query][0][value]"] = "manga";
  }

  if (request.sort) {
    switch (request.sort.id) {
      case "latest":
        body["vars[orderby]"] = "meta_value_num";
        body["vars[order]"] = "DESC";
        body["vars[meta_key]"] = "_latest_update";
        break;
      case "alphabet":
        body["vars[orderby]"] = "post_title";
        body["vars[order]"] = "ASC";
        break;
      case "rating":
        body["vars[orderby][query_average_reviews]"] = "DESC";
        body["vars[orderby][query_total_reviews]"] = "DESC";
        break;
      case "trending_daily":
        body["vars[orderby]"] = "meta_value_num";
        body["vars[meta_key]"] = "_wp_manga_day_views_value";
        body["vars[order]"] = "DESC";
        break;
      case "trending_weekly":
        body["vars[orderby]"] = "meta_value_num";
        body["vars[meta_key]"] = "_wp_manga_week_views_value";
        body["vars[order]"] = "DESC";
        break;
      case "trending_monthly":
        body["vars[orderby]"] = "meta_value_num";
        body["vars[meta_key]"] = "_wp_manga_month_views_value";
        body["vars[order]"] = "DESC";
        break;
      case "popular_allTime":
        body["vars[orderby]"] = "meta_value_num";
        body["vars[meta_key]"] = "_wp_manga_views";
        body["vars[order]"] = "DESC";
        break;
      case "new":
        body["vars[orderby]"] = "date";
        body["vars[order]"] = "DESC";
        break;
      case "completed":
        body["vars[orderby]"] = "meta_value_num";
        body["vars[meta_value]"] = "end";
        body["vars[meta_key]"] = "_wp_manga_status";
        break;
    }
  }

  if (request.query) {
    body["vars[s]"] = request.query;
  }
  return body;
};

export const imageFromElement = (element: Cheerio<AnyNode>): string => {
  const url =
    element.attr("data-src") ??
    element.attr("data-lazy-src") ??
    element.attr("srcset")?.split(" ")?.[0] ??
    element.attr("src") ??
    element.attr("data-cfsrc") ??
    "https://aegaeon.mantton.com/ceres.jpeg";

  return url
    .replace("-110x150", "")
    .replace("-175x238", "")
    .replace("-193x278", "")
    .replace("-224x320", "")
    .replace("-350x476", "");
};
export const notUpdating = (tag: AnchorTag): boolean => {
  const regex = /Updating|Atualizando/;
  return !tag.title.trim().match(regex);
};

export const generateAnchorTag = ($: CheerioAPI, node: AnyNode): AnchorTag => {
  const elem = $(node);
  const link = elem.attr("href");
  const title = elem.text().trim();
  return { link, title };
};

export const parseStatus = (str: string) => {
  if (COMPLETED_STATUS_LIST.includes(str)) return PublicationStatus.COMPLETED;
  if (ONGOING_STATUS_LIST.includes(str)) return PublicationStatus.ONGOING;
  if (HIATUS_STATUS_LIST.includes(str)) return PublicationStatus.HIATUS;
  if (CANCELLED_STATUS_LIST.includes(str)) return PublicationStatus.CANCELLED;
};

export const parseDate = (str: string, format?: string) => {
  if (["just", "now", "up"].some((v) => str.trim().toLowerCase().includes(v)))
    return new Date();
  if (str.trim().toLowerCase() === "yesterday")
    return moment().subtract(1, "day").toDate();
  return parseRelativeDate(str)?.toDate() ?? moment(str, format).toDate();
};
export const parseRelativeDate = (str: string) => {
  const numStr = str.match(/(\d+)/)?.[1];
  if (!numStr || Number.isNaN(parseInt(numStr))) {
    return null;
  }
  const number = parseInt(numStr);

  const now = moment();
  if (DAY_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
    return now.subtract(number, "days");
  if (HOUR_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
    return now.subtract(number, "hours");
  if (MINUTE_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
    return now.subtract(number, "minutes");
  if (SECONDS_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
    return now.subtract(number, "seconds");
  if (WEEK_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
    return now.subtract(number, "weeks");
  if (MONTH_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
    return now.subtract(number, "months");
  if (YEAR_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
    return now.subtract(number, "years");

  return null;
};
