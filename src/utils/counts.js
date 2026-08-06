// src/utils/counts.js

import { compareByEmbeddedNumberThenText } from "./sorting";
import { parseCommaList } from "./strings";

export function buildCountListFromArray(values) {
    const counts = new Map();

    for (const value of values || []) {
        counts.set(value, (counts.get(value) || 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([name, count]) => ({
            name,
            count,
        }))
        .sort(
            (a, b) =>
                b.count - a.count ||
                compareByEmbeddedNumberThenText(
                    a.name,
                    b.name
                )
        );
}

export function buildCountListFromCommaField(
    works,
    field
) {
    const values = [];

    for (const work of works || []) {
        values.push(...parseCommaList(work?.[field]));
    }

    return buildCountListFromArray(values);
}

export function buildStatusCountList(works) {
    const statuses = (works || []).map(
        (work) =>
            String(work?.status || "").trim() || "未知"
    );

    return buildCountListFromArray(statuses);
}

export function buildGenreCountMap(works) {
    const genreCountList =
        buildCountListFromCommaField(
            works,
            "genre_tags"
        );

    return toCountMap(genreCountList);
}

export function toCountMap(countList) {
    return new Map(
        (countList || []).map((item) => [
            item.name,
            item.count || 0,
        ])
    );
}

export function mergeCounts(totalList, currentList) {
    const currentMap = toCountMap(currentList);

    return (totalList || []).map((item) => ({
        name: item.name,
        total: item.count || 0,
        current: currentMap.get(item.name) || 0,
    }));
}

export function mergeLangCounts(total, current) {
    return {
        mv: {
            orig: mergeCounts(
                total?.mv?.orig,
                current?.mv?.orig
            ),
            dub: mergeCounts(
                total?.mv?.dub,
                current?.mv?.dub
            ),
            sub: mergeCounts(
                total?.mv?.sub,
                current?.mv?.sub
            ),
        },
        gm: {
            sub: mergeCounts(
                total?.gm?.sub,
                current?.gm?.sub
            ),
            voice: mergeCounts(
                total?.gm?.voice,
                current?.gm?.voice
            ),
            ui: mergeCounts(
                total?.gm?.ui,
                current?.gm?.ui
            ),
        },
    };
}