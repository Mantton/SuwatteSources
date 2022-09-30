import {
  CollectionExcerpt,
  CollectionStyle,
  NetworkRequest,
} from "@suwatte/daisuke";
import { AnyNode, Cheerio, CheerioAPI } from "cheerio";

export enum AJAX_DIRECTORY {
  LATEST = "_latest_update",
  TRENDING_WEEKLY = "_wp_manga_week_views_value",
  TRENDING_DAILY = "_wp_manga_day_views_value",
  TRENDING_MONTHLY = "_wp_manga_month_views_value",
  POPULAR_AT = "_wp_manga_views",
  COMPLETED = "_wp_manga_status",
  MOST_REVIEWED = "_manga_total_votes",
  TOP_RATED = "_manga_avarage_reviews",
  NEW = "date",
}

export namespace AJAX_DIRECTORY {
  export function fromString(dir: string): AJAX_DIRECTORY {
    return (AJAX_DIRECTORY as any)[dir];
  }
}
export const ajaxDirectoryRequest = (
  domain: string,
  page: number,
  type: string
): NetworkRequest => {
  let body = {
    action: "madara_load_more",
    template: "madara-core/content/content-archive",
    "vars[manga_archives_item_layout]": "big_thumbnail",
    "vars[paged]": "1",
    "vars[orderby]": type !== AJAX_DIRECTORY.NEW ? "meta_value_num" : "date",
    "vars[template]": "archive",
    "vars[sidebar]": "right",
    "vars[post_type]": "wp-manga",
    "vars[post_status]": "publish",
    "vars[order]": "desc",
    "vars[posts_per_page]": 30,
    "vars[meta_key]": type !== AJAX_DIRECTORY.NEW ? type : "",
    "vars[meta_value]": type == AJAX_DIRECTORY.COMPLETED ? "end" : "",
    page: page - 1,
  };

  return {
    url: `${domain}/wp-admin/admin-ajax.php`,
    method: "POST",
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      referer: domain,
    },
    cookies: [
      {
        name: "wpmanga-adault",
        domain: ".toonily.com",
        value: "0",
      },
    ],
  };
};

export const generateExploreSections = (): CollectionExcerpt[] => {
  const sections: CollectionExcerpt[] = [
    {
      id: AJAX_DIRECTORY.POPULAR_AT,
      title: "Popular Titles",
      subtitle: `The "Must Reads"`,
      style: CollectionStyle.INFO,
    },
    {
      id: AJAX_DIRECTORY.TRENDING_DAILY,
      title: "Trending Daily",
      subtitle: `What we're "reading"`,
      style: CollectionStyle.NORMAL,
    },
    {
      id: AJAX_DIRECTORY.NEW,
      title: "Recently Added Series",
      subtitle: `Fresh from the bakery, discover new stories`,
      style: CollectionStyle.NORMAL,
    },
    {
      id: AJAX_DIRECTORY.TRENDING_WEEKLY,
      title: "Trending Weekly",
      subtitle: `Top Reads from this past week.`,
      style: CollectionStyle.NORMAL,
    },
    {
      id: AJAX_DIRECTORY.TOP_RATED,
      title: "Top Rated Titles",
      subtitle: `Guaranteed Bangers 🔥`,
      style: CollectionStyle.NORMAL,
    },
    {
      id: AJAX_DIRECTORY.TRENDING_MONTHLY,
      title: "Trending Monthly",
      subtitle: `Top Reads from this past month.`,
      style: CollectionStyle.NORMAL,
    },

    {
      id: AJAX_DIRECTORY.COMPLETED,
      title: "Completed Titles",
      subtitle: `Perfect for binging.`,
      style: CollectionStyle.NORMAL,
    },
    {
      id: AJAX_DIRECTORY.MOST_REVIEWED,
      title: "Top Reviewed Series",
      subtitle: `Titles that get the community talking`,
      style: CollectionStyle.INFO,
    },
    {
      id: AJAX_DIRECTORY.LATEST,
      title: "Latest Updates",
      style: CollectionStyle.UPDATE_LIST,
    },
  ];

  return sections;
};

export const imageFromElement = (element: any): string => {
  const srcset = element.attr("srcset");
  const dataSrcSet = element.attr("data-srcset");
  if (srcset) {
    const [last] = srcset.split(", ").splice(-1);
    return last.split(" ")[0]?.trim() ?? "";
  } else if (dataSrcSet) {
    const [last] = dataSrcSet.split(", ").splice(-1);
    return last.split(" ")[0]?.trim() ?? "";
  }
  return (
    element.attr("srcset") ??
    element.attr("srcset")?.split(" ")[0] ??
    element.attr("data-src") ??
    element.attr("data-lazy-src") ??
    element.attr("src") ??
    element.attr("data-cfsrc") ??
    ""
  );
};
