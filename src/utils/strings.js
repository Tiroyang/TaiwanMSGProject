// src/utils/strings.js

import {
    compareByEmbeddedNumberThenText,
} from "./sorting";


/* =========================================================
   基本 Parser
========================================================= */

export function parseDelimitedList(
    value,
    delimiter = ","
) {
    return String(value || "")
        .split(delimiter)
        .map((item) => item.trim())
        .filter(Boolean);
}

export function parseCommaList(value) {
    return parseDelimitedList(
        value,
        ","
    );
}

export function parseSlashList(value) {
    return parseDelimitedList(
        value,
        "/"
    );
}


/**
 * 解析：
 * (label, value), (label, value)
 *
 * label 可為空，例如：
 * (, Baby Go Home/Bobby)
 */
export function parseParenthesizedPairs(
    value
) {
    const result = [];

    const text =
        String(value || "");

    const regex =
        /\(([^,]*),\s*([^)]+)\)/g;

    let match;

    while (
        (match = regex.exec(text)) !==
        null
    ) {
        result.push({
            label:
                match[1].trim(),

            value:
                match[2].trim(),
        });
    }

    return result;
}


/* =========================================================
   Formatter
========================================================= */

export function splitToZhList(value) {
    const items =
        parseCommaList(value);

    return items.length > 0
        ? items.join("、")
        : "無";
}

export function formatZhList(
    values
) {
    return (values || [])
        .filter(Boolean)
        .join("、");
}


/* =========================================================
   演員
========================================================= */

export function formatActorList(value) {
    return parseCommaList(value)
        .map((item) =>
            item
                .replace(
                    /\(.*?\)/g,
                    ""
                )
                .trim()
        )
        .filter(Boolean)
        .join(",");
}

export function parseActorRoles(value) {
    return parseCommaList(value)
        .map((item) => {
            const match =
                item.match(
                    /^(.*?)\s*\((.*?)\)\s*$/
                );

            if (!match) {
                return {
                    actor: item,
                    role: "",
                };
            }

            return {
                actor:
                    match[1].trim(),

                role:
                    match[2].trim(),
            };
        });
}


/* =========================================================
   發布日期
========================================================= */

export function parsePlaceDatePairs(
    value
) {
    return parseParenthesizedPairs(
        value
    ).map((item) => ({
        place: item.label,

        dateRaw:
            item.value,
    }));
}


/* =========================================================
   其他標題
========================================================= */

export function parseOtherTitleGroups(
    value
) {
    return parseParenthesizedPairs(
        value
    ).map((item) => ({
        place: item.label,

        titles:
            parseSlashList(
                item.value
            ),
    }));
}


/* =========================================================
   國家
========================================================= */

function countryRank(name) {
    const value =
        String(name || "").trim();

    const normalized =
        value.replace("臺", "台");

    if (
        normalized === "台灣"
    ) {
        return 0;
    }

    if (
        normalized.includes(
            "日治台灣"
        )
    ) {
        return 1;
    }

    return 999;
}

export function formatCountriesSorted(
    countriesStr
) {
    const countries =
        parseCommaList(
            countriesStr
        );

    if (!countries.length) {
        return "";
    }

    countries.sort((a, b) => {
        const rankA =
            countryRank(a);

        const rankB =
            countryRank(b);

        if (rankA !== rankB) {
            return rankA - rankB;
        }

        return compareByEmbeddedNumberThenText(
            a,
            b
        );
    });

    return countries.join(", ");
}