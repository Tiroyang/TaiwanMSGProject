// src/utils/filters.js

import {
    expandToRange,
    parseYMDLoose,
    rangesOverlap,
} from "./dates";

import { parseSupportedLanguages } from "./languages";
import { parseCommaList } from "./strings";

export function isTaiwanLike(name) {
    const normalized = String(name || "")
        .replace("臺", "台")
        .trim();

    return (
        normalized === "台灣" ||
        normalized.includes("日治台灣")
    );
}

function isTW(name) {
    const normalized = String(name || "")
        .replace("臺", "台")
        .trim();

    return normalized === "台灣";
}

function isJP_TW(name) {
    const normalized = String(name || "")
        .replace("臺", "台")
        .trim();

    return normalized === "日治台灣";
}

export function getTri(triMap, name) {
    return triMap?.get?.(name) || "show";
}

export function matchTriTags(items, triMap) {
    const forced = [];
    const hidden = new Set();

    for (const [name, state] of triMap?.entries?.() || []) {
        if (state === "force") {
            forced.push(name);
        }

        if (state === "hide") {
            hidden.add(name);
        }
    }

    if (forced.length > 0) {
        const includesForced = items.some((item) =>
            forced.includes(item)
        );

        if (!includesForced) {
            return false;
        }
    }

    return !items.some(
        (item) =>
            hidden.has(item) &&
            !forced.includes(item)
    );
}

export function applyAdvancedFilters(works, filters) {
    return (works || []).filter((work) => {
        if (filters.hideTypes?.[work.work_type_key]) {
            return false;
        }

        if (
            filters.hideNoMainImage &&
            !work.main_image_url
        ) {
            return false;
        }

        if (
            filters.statusHidden?.has?.(work.status)
        ) {
            return false;
        }

        if (
            filters.dateRange?.hideNoDate &&
            !work.release_date_simp
        ) {
            return false;
        }

        const hasDateRange =
            filters.dateRange?.start ||
            filters.dateRange?.end;

        if (hasDateRange && work.release_date_simp) {
            const workParts = parseYMDLoose(
                work.release_date_simp
            );

            if (workParts) {
                const [workStart, workEnd] =
                    expandToRange(workParts);

                const filterStartParts = parseYMDLoose(
                    filters.dateRange.start
                );

                const filterEndParts = parseYMDLoose(
                    filters.dateRange.end
                );

                const filterStart = filterStartParts
                    ? expandToRange(filterStartParts)[0]
                    : new Date(-8640000000000000);

                const filterEnd = filterEndParts
                    ? expandToRange(filterEndParts)[1]
                    : new Date(8640000000000000);

                if (
                    !rangesOverlap(
                        workStart,
                        workEnd,
                        filterStart,
                        filterEnd
                    )
                ) {
                    return false;
                }
            }
        }

        const countries = parseCommaList(work.countries);

        if (
            !matchTriTags(
                countries,
                filters.countryTri
            )
        ) {
            return false;
        }

        if (
            filters.countryCoMode &&
            countries.length > 0 &&
            countries.every(isTaiwanLike)
        ) {
            return false;
        }

        const genres = parseCommaList(work.genre_tags);

        if (
            !matchTriTags(
                genres,
                filters.genreTri
            )
        ) {
            return false;
        }

        if (filters.langMode === "mv") {
            if (work.work_type_key === "games") {
                return false;
            }

            const parsed = parseSupportedLanguages(
                work.supported_languages
            );

            const branch = filters.langMV.active;
            const languages = parsed.mv[branch] || [];
            const hidden =
                filters.langMV.hidden[branch] || new Set();

            if (
                languages.some((language) =>
                    hidden.has(language)
                )
            ) {
                return false;
            }
        }

        if (filters.langMode === "gm") {
            if (work.work_type_key !== "games") {
                return false;
            }

            const parsed = parseSupportedLanguages(
                work.supported_languages
            );

            const branch = filters.langGM.active;
            const languages = parsed.gm[branch] || [];
            const hidden =
                filters.langGM.hidden[branch] || new Set();

            if (
                languages.some((language) =>
                    hidden.has(language)
                )
            ) {
                return false;
            }
        }

        return true;
    });
}

// 篩選邏輯
export function deriveCountryUi(countryTri, names, countryCoMode) {
    const taiwanNames = names.filter(isTaiwanLike);
    const foreignNames = names.filter((n) => !isTaiwanLike(n));

    const hasForce = names.some((n) => getTri(countryTri, n) === "force");

    const allSelected = names.length > 0 && names.every((n) => getTri(countryTri, n) !== "hide");
    const allHidden = names.length > 0 && names.every((n) => getTri(countryTri, n) === "hide");

    const taiwanSelected = taiwanNames.some((n) => getTri(countryTri, n) !== "hide");
    const taiwanAnyForce = taiwanNames.some((n) => getTri(countryTri, n) === "force");
    const taiwanAllHidden = taiwanNames.length > 0 && taiwanNames.every((n) => getTri(countryTri, n) === "hide");

    const foreignAnySelected = foreignNames.some((n) => getTri(countryTri, n) !== "hide");
    const foreignAllHidden = foreignNames.length > 0 && foreignNames.every((n) => getTri(countryTri, n) === "hide");

    const twExists = names.some(isTW);
    const jpTwExists = names.some(isJP_TW);

    const twTri = twExists ? getTri(countryTri, names.find(isTW)) : null;
    const jpTwTri = jpTwExists ? getTri(countryTri, names.find(isJP_TW)) : null;

    const twSelected = twExists ? twTri !== "hide" : false;
    const jpTwSelected = jpTwExists ? jpTwTri !== "hide" : false;

    const _bothSelected = twExists && jpTwExists && twSelected && jpTwSelected;
    const bothHidden = twExists && jpTwExists && !twSelected && !jpTwSelected;

    const coInvalid = foreignAllHidden || bothHidden;

    // 既有按鈕判斷（coMode 會覆蓋）
    const showAllOn = allSelected && !hasForce;
    const hideAllOn = allHidden && !hasForce;
    const foreignOn = taiwanAllHidden && !taiwanAnyForce && foreignAnySelected;

    const taiwanForceCount = taiwanNames.filter((n) => getTri(countryTri, n) === "force").length;
    const localOn = taiwanSelected && foreignAllHidden && !(taiwanForceCount === 2);

    // co 只在「手動啟動」且「未失效」時生效
    const coOn = !!countryCoMode && !coInvalid;

    // 優先順序(coMode 優先)
    let presetUi = "custom";
    if (coOn) presetUi = "co";
    else if (showAllOn) presetUi = "showAll";
    else if (hideAllOn) presetUi = "hideAll";
    else if (foreignOn) presetUi = "foreign";
    else if (localOn) presetUi = "local";

    const hint =
        presetUi === "co"
            ? "已排除由台灣單獨製作的台灣本土作品"
            : presetUi === "foreign"
                ? "僅包含在台灣拍攝或/和設定在台灣的作品"
                : presetUi === "local"
                    ? "由台灣單獨製作的本土作品"
                    : "";

    return {
        presetUi,
        hint,
        hintEnabled: presetUi === "co" || presetUi === "foreign" || presetUi === "local",
        coInvalid, // 外面可用
    };
}

export function deriveGenreUi(triMap, names) {
    const getTri = (n) => triMap.get(n) || "show";

    const hasForce = names.some((n) => getTri(n) === "force");
    const showAllOn = !hasForce && names.length > 0 && names.every((n) => getTri(n) !== "hide");
    const hideAllOn = !hasForce && names.length > 0 && names.every((n) => getTri(n) === "hide");

    let presetUi = "custom";
    if (showAllOn) presetUi = "showAll";
    else if (hideAllOn) presetUi = "hideAll";

    return { presetUi, hasForce };
}

// 國家篩選區塊
export function nextCountryFiltersByPreset(prevFilters, presetKey, countryNames) {
    // 其他按鈕：一律關閉 coMode
    if (presetKey !== "co") {
        let nextTri = prevFilters.countryTri;

        if (presetKey === "showAll") {
            nextTri = new Map();
        } else if (presetKey === "hideAll") {
            nextTri = new Map();
            for (const n of countryNames) nextTri.set(n, "hide");
        } else if (presetKey === "foreign") {
            nextTri = new Map();
            for (const n of countryNames) nextTri.set(n, isTaiwanLike(n) ? "hide" : "show");
        } else if (presetKey === "local") {
            nextTri = new Map();
            for (const n of countryNames) nextTri.set(n, isTaiwanLike(n) ? "show" : "hide");
        }

        return {
            ...prevFilters,
            countryTri: nextTri,
            countryPreset: presetKey,
            countryCoMode: false,
        };
    }

    // presetKey === "co"
    const willTurnOn = !prevFilters.countryCoMode;

    if (willTurnOn) {
        // 啟動 co：全選，並開啟 coMode
        const nextTri = new Map();
        for (const n of countryNames) nextTri.set(n, "show");

        return {
            ...prevFilters,
            countryTri: nextTri,
            countryPreset: "co",
            countryCoMode: true,
        };
    }

    // 再按一次：只熄滅 coMode，不改 tri（你要求）
    return {
        ...prevFilters,
        countryPreset: "none",
        countryCoMode: false,
    };
}
