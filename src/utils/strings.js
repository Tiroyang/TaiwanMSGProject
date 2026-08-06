// src/utils/strings.js

import {
    compareByEmbeddedNumberThenText,
} from "../utils/sorting";

/* parser */
export function parseCommaList(value) {
    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

/* formatter */
export function splitToZhList(value) {
    const items = parseCommaList(value);
    return items.length > 0 ? items.join("、") : "無";
}

export function formatActorList(value) {
    return parseCommaList(value)
        .map((item) => item.replace(/\(.*?\)/g, "").trim())
        .filter(Boolean)
        .join(",");
}

export function parseActorRoles(value) {
    return parseCommaList(value).map((item) => {
        const match = item.match(/^(.*?)\s*\((.*?)\)\s*$/);

        if (!match) {
            return {
                actor: item,
                role: "",
            };
        }

        return {
            actor: match[1].trim(),
            role: match[2].trim(),
        };
    });
}

export function parsePlaceDatePairs(value) {
    const result = [];
    const regex = /\(([^,]+),\s*([^)]+)\)/g;
    const text = String(value || "");

    let match;

    while ((match = regex.exec(text)) !== null) {
        result.push({
            place: match[1].trim(),
            dateRaw: match[2].trim(),
        });
    }

    return result;
}

// 國家排序
function countryRank(name) {
    const s = String(name || "").trim();
    const norm = s.replace("臺", "台");

    if (norm === "台灣") return 0;
    if (norm.includes("日治台灣")) return 1;
    return 999;
}

export function formatCountriesSorted(countriesStr) {
    const arr = parseCommaList(countriesStr);
    if (!arr.length) return "";

    arr.sort((a, b) => {
        const ra = countryRank(a);
        const rb = countryRank(b);
        if (ra !== rb) return ra - rb;
        return compareByEmbeddedNumberThenText(a, b);
    });

    return arr.join(", ");
}