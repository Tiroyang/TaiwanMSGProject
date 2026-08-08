// src/utils/search.js

const SEARCHABLE_FIELDS = [
    "id",
    "status",
    "work_type",
    "title_zh",
    "title_original",
    "title_en",
    "release_date_simp",
    "release_date",
    "countries",
    "director",
    "main_cast",
    "developer",
    "publisher",
    "platforms",
    "runtime",
    "episode_total_count",
    "genre_tags",
    "pricing_model",
    "supported_languages",
    "description_zh",
    "description_en",
];

export function normalizeSearchText(value) {
    return String(value ?? "")
        .replaceAll("_", " ")
        .trim();
}

function getFieldText(work, field) {
    const value = work?.[field];

    if (value == null) {
        return "";
    }

    return Array.isArray(value)
        ? value.join(" ")
        : String(value);
}

function getGlobalSearchText(work) {
    return SEARCHABLE_FIELDS
        .map((field) => getFieldText(work, field))
        .join(" ");
}

function parseTokenBlock(raw) {
    const text = normalizeSearchText(raw);

    if (!text) {
        return {
            plus: [],
            minus: [],
            plain: [],
        };
    }

    const result = {
        plus: [],
        minus: [],
        plain: [],
    };

    for (const token of text.split(/\s+/).filter(Boolean)) {
        if (token.startsWith("+") && token.length > 1) {
            result.plus.push(token.slice(1));
        } else if (
            token.startsWith("-") &&
            token.length > 1
        ) {
            result.minus.push(token.slice(1));
        } else {
            result.plain.push(token);
        }
    }

    return result;
}

export function parseSearchQuery(input) {
    const query = normalizeSearchText(input);

    if (!query) {
        return {
            mode: "none",
            blocks: [],
        };
    }

    const advanced =
        query.includes("|") ||
        /field\s*:/i.test(query);

    if (!advanced) {
        return {
            mode: "basic",
            blocks: [
                {
                    field: null,
                    ...parseTokenBlock(query),
                },
            ],
        };
    }

    const blocks = query
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((segment) => {
            const match = segment.match(
                /^field\s*:\s*([a-zA-Z0-9_]+)\s*(.*)$/i
            );

            if (!match) {
                return {
                    field: null,
                    ...parseTokenBlock(segment),
                };
            }

            return {
                field: match[1],
                ...parseTokenBlock(match[2] || ""),
            };
        });

    return {
        mode: "advanced",
        blocks,
    };
}

function textHas(haystack, needle) {
    const source = String(haystack ?? "").toLowerCase();
    const query = String(needle ?? "").toLowerCase();

    return query ? source.includes(query) : false;
}

function matchBlock(work, block) {
    const source = block.field
        ? getFieldText(work, block.field)
        : getGlobalSearchText(work);

    if (
        block.minus.some((keyword) =>
            textHas(source, keyword)
        )
    ) {
        return false;
    }

    const required =
        block.plus.length > 0
            ? block.plus
            : block.plain;

    return required.every((keyword) =>
        textHas(source, keyword)
    );
}

export function applySearchFilter(works, input) {
    const parsed = parseSearchQuery(input);

    if (parsed.mode === "none") {
        return works;
    }

    return (works || []).filter((work) =>
        parsed.blocks.every((block) =>
            matchBlock(work, block)
        )
    );
}