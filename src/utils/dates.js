// src/utils/dates.js

export function normalizeDateText(value) {
    return String(value || "")
        .trim()
        .replaceAll("/", "-");
}

export function toNativeDateValue(value) {
    const normalized = normalizeDateText(value);

    return /^\d{4}-\d{2}-\d{2}$/.test(normalized)
        ? normalized
        : "";
}

export function lastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

export function parseYMDLoose(value) {
    const text = normalizeDateText(value);

    if (!text) {
        return null;
    }

    const match = text.match(
        /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/
    );

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = match[2] ? Number(match[2]) : null;
    const day = match[3] ? Number(match[3]) : null;

    if (!Number.isFinite(year) || year <= 0) {
        return null;
    }

    if (
        month !== null &&
        (!Number.isFinite(month) || month < 1 || month > 12)
    ) {
        return null;
    }

    if (day !== null) {
        if (month === null) {
            return null;
        }

        if (
            !Number.isFinite(day) ||
            day < 1 ||
            day > lastDayOfMonth(year, month)
        ) {
            return null;
        }
    }

    return {
        y: year,
        mo: month,
        d: day,
    };
}

export function expandToRange(parts) {
    const {
        y: year,
        mo: month,
        d: day,
    } = parts;

    if (!month) {
        return [
            new Date(year, 0, 1),
            new Date(year, 11, 31),
        ];
    }

    if (!day) {
        return [
            new Date(year, month - 1, 1),
            new Date(
                year,
                month - 1,
                lastDayOfMonth(year, month)
            ),
        ];
    }

    const date = new Date(year, month - 1, day);
    return [date, date];
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart <= bEnd && bStart <= aEnd;
}

export function parseLooseDateToNumber(value) {
    const text = normalizeDateText(value);

    if (!text) {
        return null;
    }

    const match = text.match(
        /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/
    );

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = match[2] ? Number(match[2]) : 0;
    const day = match[3] ? Number(match[3]) : 0;

    return year * 10000 + month * 100 + day;
}

export function validateAndNormalizeDateRange(dateRange) {
    const start = normalizeDateText(dateRange?.start);
    const end = normalizeDateText(dateRange?.end);

    const startParts = start ? parseYMDLoose(start) : null;
    const endParts = end ? parseYMDLoose(end) : null;

    if (start && !startParts) {
        return { ok: false };
    }

    if (end && !endParts) {
        return { ok: false };
    }

    if (!startParts && !endParts) {
        return {
            ok: true,
            start: "",
            end: "",
            swapped: false,
        };
    }

    const startMin = startParts
        ? expandToRange(startParts)[0]
        : new Date(-8640000000000000);

    const endMax = endParts
        ? expandToRange(endParts)[1]
        : new Date(8640000000000000);

    if (startParts && endParts && startMin > endMax) {
        return {
            ok: true,
            start: end,
            end: start,
            swapped: true,
        };
    }

    return {
        ok: true,
        start,
        end,
        swapped: false,
    };
}

export function formatChineseDate(value) {
    if (!value) {
        return "未定";
    }

    return String(value)
        .split("~")
        .map((dateText) => {
            const parts = dateText.trim().split("-");

            if (parts.length === 3) {
                const [year, month, day] = parts;
                return `${year}年${Number(month)}月${Number(day)}日`;
            }

            if (parts.length === 2) {
                const [year, month] = parts;
                return `${year}年${Number(month)}月`;
            }

            return `${parts[0]}年`;
        })
        .join(" ~ ");
}