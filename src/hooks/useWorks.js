// src/hooks/useWorks.js

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { fetchWorksData } from "../api/worksApi";

import {
    normalizeTags,
    normalizeWorks,
} from "../utils/normalize";

export function useWorks({
    enabled = true,
    type,
} = {}) {
    const [works, setWorks] = useState([]);

    const [tagMap, setTagMap] = useState(
        () => new Map()
    );

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);

    const abortControllerRef = useRef(null);
    const hasLoadedRef = useRef(false);

    const loadWorks = useCallback(
        async ({ force = false } = {}) => {
            if (!enabled) {
                return;
            }

            if (
                hasLoadedRef.current &&
                !force
            ) {
                return;
            }

            abortControllerRef.current?.abort();

            const controller =
                new AbortController();

            abortControllerRef.current =
                controller;

            setLoading(true);
            setError(null);

            try {
                const apiData =
                    await fetchWorksData({
                        type,
                        signal: controller.signal,
                    });

                setWorks(
                    normalizeWorks(apiData)
                );

                setTagMap(
                    normalizeTags(apiData)
                );

                hasLoadedRef.current = true;
            } catch (error) {
                if (
                    error?.name === "AbortError"
                ) {
                    return;
                }

                console.error(
                    "載入作品資料失敗：",
                    error
                );

                hasLoadedRef.current = false;

                setError(
                    error instanceof Error
                        ? error.message
                        : "無法連接 API 或資料格式錯誤"
                );

                setWorks([]);
                setTagMap(new Map());
            } finally {
                if (
                    abortControllerRef.current ===
                    controller
                ) {
                    setLoading(false);
                }
            }
        },
        [enabled, type]
    );

    const reload = useCallback(() => {
        return loadWorks({
            force: true,
        });
    }, [loadWorks]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        loadWorks();

        return () => {
            abortControllerRef.current?.abort();
        };
    }, [enabled, loadWorks]);

    return {
        works,
        tagMap,
        loading,
        error,
        reload,
    };
}