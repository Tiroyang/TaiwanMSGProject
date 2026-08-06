// src/api/worksApi.js

const API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

const DEFAULT_CONTENT_TYPE =
    import.meta.env.VITE_CONTENT_TYPE || "all";

const ALLOWED_CONTENT_TYPES = new Set([
    "all",
    "movies",
    "series",
    "games",
]);

function getApiUrl(type) {
    if (!API_URL) {
        throw new Error(
            "缺少 VITE_GOOGLE_SHEET_API_URL 環境變數"
        );
    }

    const normalizedType = String(
        type || DEFAULT_CONTENT_TYPE
    )
        .trim()
        .toLowerCase();

    if (!ALLOWED_CONTENT_TYPES.has(normalizedType)) {
        throw new Error(
            `不支援的內容類型：${normalizedType}`
        );
    }

    const url = new URL(API_URL);
    url.searchParams.set("type", normalizedType);

    return url.toString();
}

export async function fetchWorksData({
    type = DEFAULT_CONTENT_TYPE,
    signal,
} = {}) {
    const url = getApiUrl(type);

    const response = await fetch(url, {
        method: "GET",
        signal,
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(
            `API 請求失敗：HTTP ${response.status}`
        );
    }

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("API 回傳的內容不是有效 JSON");
    }

    if (data?.status !== "success") {
        throw new Error(
            data?.message || "API 回傳錯誤"
        );
    }

    return data;
}