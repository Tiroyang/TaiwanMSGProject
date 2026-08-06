// src/utils/workStyles.js

export function getTypeClass(work) {
    const key = work?.work_type_key;

    if (key === "movies") {
        return "type-movie";
    }

    if (key === "series") {
        return "type-series";
    }

    if (key === "games") {
        return "type-game";
    }

    const id = String(work?.id || "");

    if (id.startsWith("movie")) {
        return "type-movie";
    }

    if (id.startsWith("series")) {
        return "type-series";
    }

    return "type-game";
}

export function getStatusClass(status) {
    const value = String(status || "");

    if (
        value.includes("已發布") ||
        value.includes("已發佈") ||
        value.includes("已發行")
    ) {
        return "status-active";
    }

    if (value.includes("正在")) {
        return "status-now";
    }

    if (
        value.includes("開發") ||
        value.includes("拍攝") ||
        value.includes("殺青")
    ) {
        return "status-dev";
    }

    return "status-other";
}