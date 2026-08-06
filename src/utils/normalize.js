// src/utils/normalize.js

export const TYPE_MAP = {
  movies: {
    key: "movies",
    label: "電影",
  },
  series: {
    key: "series",
    label: "影集",
  },
  games: {
    key: "games",
    label: "遊戲",
  },
};

export function normalizeWorks(apiJson) {
  const works = [];

  function pushList(listKey) {
    const list = apiJson?.[listKey] ?? [];
    const typeLabel =
      TYPE_MAP[listKey]?.label || "未知";

    for (const item of list) {
      if (!item?.id) {
        continue;
      }

      works.push({
        ...item,
        id: String(item.id),
        work_type: typeLabel,
        work_type_key: listKey,
        title_zh: item.title_zh ?? "",
        title_original: item.title_original ?? "",
        title_en: item.title_en ?? "",
        runtime: item.runtime ?? "",
      });
    }
  }

  pushList("movies");
  pushList("series");
  pushList("games");

  return works;
}

export function normalizeTags(apiJson) {
  const tags = apiJson?.tags ?? [];
  const map = new Map();

  for (const item of tags) {
    const nameZh = String(
      item?.tag_names_zh || ""
    ).trim();

    const nameEn = String(
      item?.tag_names_en || ""
    ).trim();

    if (!nameZh && !nameEn) {
      continue;
    }

    const tag = {
      nameZh,
      nameEn,
      definitionZh: String(
        item?.definition_zh || ""
      ).trim(),
      definitionEn: String(
        item?.definition_en || ""
      ).trim(),
    };

    if (nameZh) {
      map.set(nameZh, tag);
    }

    if (nameEn) {
      map.set(nameEn, tag);
    }
  }

  return map;
}