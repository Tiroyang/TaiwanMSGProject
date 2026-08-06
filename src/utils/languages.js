// src/utils/languages.js

import { buildCountListFromArray } from "./counts";

export function parseSupportedLanguages(value) {
    const result = {
        mv: {
            orig: [],
            dub: [],
            sub: [],
        },
        gm: {
            sub: [],
            voice: [],
            ui: [],
        },
    };

    const text = String(value || "").trim();

    if (!text) {
        return result;
    }

    const regex = /\(([^,]+),\s*([^)]+)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const key = String(match[1] || "")
            .replaceAll("　", "")
            .trim();

        const items = String(match[2] || "")
            .split("/")
            .map((item) =>
                item.replace(/\s*\(.*/g, "").trim()
            )
            .filter(Boolean);

        const normalizedItems =
            items.length > 0 ? items : ["無"];

        if (key === "原") {
            result.mv.orig.push(...normalizedItems);
        }

        if (key === "配") {
            result.mv.dub.push(...normalizedItems);
        }

        if (key === "字") {
            result.mv.sub.push(...normalizedItems);
            result.gm.sub.push(...normalizedItems);
        }

        if (key === "語") {
            result.gm.voice.push(...normalizedItems);
        }

        if (key === "介") {
            result.gm.ui.push(...normalizedItems);
        }
    }

    return result;
}

export function buildLangCounts(works) {
    const values = {
        mvOrig: [],
        mvDub: [],
        mvSub: [],
        gmSub: [],
        gmVoice: [],
        gmUI: [],
    };

    for (const work of works || []) {
        const parsed = parseSupportedLanguages(
            work?.supported_languages
        );

        if (
            work?.work_type_key === "movies" ||
            work?.work_type_key === "series"
        ) {
            values.mvOrig.push(...parsed.mv.orig);
            values.mvDub.push(...parsed.mv.dub);
            values.mvSub.push(...parsed.mv.sub);
        }

        if (work?.work_type_key === "games") {
            values.gmSub.push(...parsed.gm.sub);
            values.gmVoice.push(...parsed.gm.voice);
            values.gmUI.push(...parsed.gm.ui);
        }
    }

    return {
        mv: {
            orig: buildCountListFromArray(values.mvOrig),
            dub: buildCountListFromArray(values.mvDub),
            sub: buildCountListFromArray(values.mvSub),
        },
        gm: {
            sub: buildCountListFromArray(values.gmSub),
            voice: buildCountListFromArray(values.gmVoice),
            ui: buildCountListFromArray(values.gmUI),
        },
    };
}