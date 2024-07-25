import { type Flatten, flatten } from "@solid-primitives/i18n";
import type rawDict from "./zh-cn.json";

const localeList = ["zh_cn", "en_us", "zh_tw", "ja_jp", "de_de", "es_es", "fr_fr", "ko_kr", "ru_ru"] as const;
export type Locale = (typeof localeList)[number];
export type RawDict = typeof rawDict;
export type Dict = Flatten<RawDict>;

export async function fetchDictionary(locale: Locale): Promise<Dict> {
  let dict: RawDict;
  // NOTE: workaround for dynamic import
  switch (locale) {
    case "en_us":
      dict = await import("./en-us.json");
      break;
    case "zh_cn":
      dict = await import("./zh-cn.json");
      break;
    case "zh_tw":
      dict = await import("./zh-tw.json");
      break;
    case "ja_jp":
      dict = await import("./ja-jp.json");
      break;
    case "de_de":
      dict = await import("./de-de.json");
      break;
    case "es_es":
      dict = await import("./es-es.json");
      break;
    case "fr_fr":
      dict = await import("./fr-fr.json");
      break;
    case "ko_kr":
      dict = await import("./ko-kr.json");
      break;
    case "ru_ru":
      dict = await import("./ru-ru.json");
      break;
  }
  // flatten the dictionary to make all nested keys available top-level
  return flatten(dict);
}

export function hasLocale(locale: unknown): locale is Locale {
  return typeof locale === "string" && localeList.includes(locale as Locale);
}
