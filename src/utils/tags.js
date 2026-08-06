// src/utils/tags.js

import { compareByEmbeddedNumberThenText } from "./sorting";
import { parseCommaList } from "./strings";

export function getTagView(rawTag, tagMap, lang = "zh") {
    const key = String(rawTag || "").trim();
    const item = tagMap?.get?.(key);

    if (!item) {
        return {
            label: key,
            definition: "",
        };
    }

    const isEnglish = lang === "en";

    return {
        label: isEnglish
            ? item.nameEn || item.nameZh || key
            : item.nameZh || item.nameEn || key,

        definition: isEnglish
            ? item.definitionEn || item.definitionZh || ""
            : item.definitionZh || item.definitionEn || "",
    };
}

export function getTagTitle(rawTag, tagMap, lang = "zh") {
    const tag = getTagView(rawTag, tagMap, lang);

    if (!tag.definition) {
        return "";
    }

    return `${tag.label}：${tag.definition}`;
}

export function getSortedGenreTagsByFrequency(
    genreTags,
    genreCountMap = new Map()
) {
    return parseCommaList(genreTags).sort((a, b) => {
        const countA = genreCountMap.get(a) || 0;
        const countB = genreCountMap.get(b) || 0;

        if (countA !== countB) {
            return countB - countA;
        }

        return compareByEmbeddedNumberThenText(a, b);
    });
}