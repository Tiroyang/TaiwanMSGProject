// src/utils/sorting.js

import { parseLooseDateToNumber } from "./dates";

export function compareByEmbeddedNumberThenText(a, b) {
    const valueA = String(a ?? "").trim();
    const valueB = String(b ?? "").trim();

    if (!valueA && !valueB) return 0;
    if (!valueA) return 1;
    if (!valueB) return -1;

    const startsWithNumber = (value) => /^\d/.test(value);

    const aStartsWithNumber = startsWithNumber(valueA);
    const bStartsWithNumber = startsWithNumber(valueB);

    if (aStartsWithNumber !== bStartsWithNumber) {
        return aStartsWithNumber ? -1 : 1;
    }

    if (aStartsWithNumber && bStartsWithNumber) {
        const pureA = /^\d+$/.test(valueA);
        const pureB = /^\d+$/.test(valueB);

        if (pureA && pureB) {
            const numberA = BigInt(valueA);
            const numberB = BigInt(valueB);

            if (numberA === numberB) return 0;
            return numberA > numberB ? -1 : 1;
        }

        return valueB.localeCompare(valueA, "en", {
            numeric: true,
            sensitivity: "base",
        });
    }

    return valueB.localeCompare(valueA, "en", {
        numeric: true,
        sensitivity: "base",
    });
}

export function parseIdParts(id) {
    const value = String(id || "");

    const prefix =
        value.match(/^[a-zA-Z]+/)?.[0]?.toLowerCase() || "";

    const numberMatch = value.match(/(\d+)/);

    return {
        prefix,
        number: numberMatch
            ? Number.parseInt(numberMatch[1], 10)
            : null,
    };
}

export function getSortName(work, lang = "zh") {
    if (!work) return "";

    if (lang === "en") {
        return String(
            work.title_en ||
            work.title_original ||
            work.title_zh ||
            ""
        ).trim();
    }

    return String(
        work.title_zh ||
        work.title_original ||
        work.title_en ||
        ""
    ).trim();
}

export function compareId(aId, bId) {
    const a = parseIdParts(aId);
    const b = parseIdParts(bId);

    const prefixComparison = a.prefix.localeCompare(
        b.prefix,
        "en",
        { sensitivity: "base" }
    );

    if (prefixComparison !== 0) {
        return prefixComparison;
    }

    if (a.number !== null && b.number !== null) {
        return a.number - b.number;
    }

    if (a.number !== null) return -1;
    if (b.number !== null) return 1;

    return String(aId || "").localeCompare(
        String(bId || ""),
        "en",
        { numeric: true }
    );
}

export function parseRuntimeMax(runtime) {
    const numbers = String(runtime || "").match(/\d+/g);

    if (!numbers?.length) {
        return null;
    }

    return Math.max(
        ...numbers.map((value) =>
            Number.parseInt(value, 10)
        )
    );
}

export function sortByCurrentKeepZeroOrder(list) {
    const indexed = (list || []).map((item, index) => ({
        ...item,
        __index: index,
    }));

    const nonZero = indexed
        .filter((item) => (item.current || 0) > 0)
        .sort((a, b) => {
            const countDifference =
                (b.current || 0) - (a.current || 0);

            return countDifference || a.__index - b.__index;
        });

    const zero = indexed.filter(
        (item) => (item.current || 0) <= 0
    );

    return [...nonZero, ...zero].map(
        ({ __index, ...item }) => item
    );
}

export function sortWorks(works, sortKey, sortDir) {
    let arr = Array.isArray(works) ? [...works] : [];

    if (sortKey === "episode_total_count") {
        arr = arr.filter((w) => w?.work_type_key === "series");
    } else if (sortKey === "runtime") {
        arr = arr.filter((w) => w?.work_type_key !== "games");
    }

    const dir = sortDir === "asc" ? 1 : -1;

    function placeNullLast(aVal, bVal, cmp) {
        const aNull = aVal === null || aVal === undefined || aVal === "";
        const bNull = bVal === null || bVal === undefined || bVal === "";
        // 缺值永遠排最後（不受遞增遞減影響）
        if (aNull && bNull) return 0;
        if (aNull) return 1;
        if (bNull) return -1;
        return cmp(aVal, bVal);
    }

    arr.sort((a, b) => {
        const aId = a?.id;
        const bId = b?.id;

        // 1) 發布日期(排序用) release_date_simp（用 id 當第二排序）
        if (sortKey === "release_date_simp") {
            const ad = parseLooseDateToNumber(a?.release_date_simp);
            const bd = parseLooseDateToNumber(b?.release_date_simp);

            const primary = placeNullLast(ad, bd, (x, y) => (x - y) * dir);
            if (primary !== 0) return primary;

            return compareId(aId, bId);
        }

        // 2) 編號 id 特例
        if (sortKey === "id") {
            return compareId(aId, bId) * dir;
        }

        // 3) 名稱 name 特例（先用中文；之後可擴充中/英切換）
        if (sortKey === "name") {
            const an = getSortName(a);
            const bn = getSortName(b);
            // 缺值排最後
            return placeNullLast(an, bn, (x, y) => compareByEmbeddedNumberThenText(x, y) * dir);
        }

        // 4) 總集數 episode_total_count （隱藏電影/遊戲）
        if (sortKey === "episode_total_count") {
            const ae = Number.isFinite(+a?.episode_total_count) ? +a.episode_total_count : null;
            const be = Number.isFinite(+b?.episode_total_count) ? +b.episode_total_count : null;
            return placeNullLast(ae, be, (x, y) => (x - y) * dir);
        }

        // 5) 片長 runtime（隱藏遊戲）
        if (sortKey === "runtime") {
            const ar = parseRuntimeMax(a?.runtime);
            const br = parseRuntimeMax(b?.runtime);
            return placeNullLast(ar, br, (x, y) => (x - y) * dir);
        }

        // 6) 上次更新 last_update（用 id 當第二排序）
        if (sortKey === "last_update") {
            const ad = parseLooseDateToNumber(a?.last_update);
            const bd = parseLooseDateToNumber(b?.last_update);

            const primary = placeNullLast(ad, bd, (x, y) => (x - y) * dir);
            if (primary !== 0) return primary;

            return compareId(aId, bId);
        }

        return 0;
    });

    return arr;
}