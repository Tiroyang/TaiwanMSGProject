// src/hooks/useHashRouter.js

import {
    useCallback,
    useEffect,
    useState,
} from "react";

const HOME_HASH = "";
const LIST_HASH = "#/list";
const WORK_HASH_PREFIX = "#/work/";

function parseHash() {
    const hash = window.location.hash || "";

    if (hash.startsWith(WORK_HASH_PREFIX)) {
        const encodedWorkId = hash.slice(
            WORK_HASH_PREFIX.length
        );

        let workId = encodedWorkId;

        try {
            workId = decodeURIComponent(
                encodedWorkId
            );
        } catch {
            // URL 格式不正確時保留原始 ID。
        }

        return {
            view: "detail",
            selectedWorkId: workId || null,
        };
    }

    if (hash === LIST_HASH) {
        return {
            view: "list",
            selectedWorkId: null,
        };
    }

    return {
        view: "home",
        selectedWorkId: null,
    };
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
    });
}

export function useHashRouter() {
    const [route, setRoute] = useState(
        () => parseHash()
    );

    useEffect(() => {
        function handleHashChange() {
            setRoute(parseHash());
        }

        window.addEventListener(
            "hashchange",
            handleHashChange
        );

        return () => {
            window.removeEventListener(
                "hashchange",
                handleHashChange
            );
        };
    }, []);

    const goHome = useCallback(() => {
        window.location.hash = HOME_HASH;
        scrollToTop();
    }, []);

    const goList = useCallback(() => {
        window.location.hash = LIST_HASH;
        scrollToTop();
    }, []);

    const goToWork = useCallback(
        (workOrId) => {
            const workId =
                typeof workOrId === "object"
                    ? workOrId?.id
                    : workOrId;

            if (
                workId === null ||
                workId === undefined ||
                workId === ""
            ) {
                return;
            }

            sessionStorage.setItem(
                "work-list-scroll-y",
                String(window.scrollY)
            );

            const encodedWorkId =
                encodeURIComponent(
                    String(workId)
                );

            window.location.hash =
                `${WORK_HASH_PREFIX}${encodedWorkId}`;

            scrollToTop();
        },
        []
    );

    const backToList = useCallback(() => {
        const savedScrollY = Number(
            sessionStorage.getItem(
                "work-list-scroll-y"
            ) || 0
        );

        window.location.hash = LIST_HASH;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: Number.isFinite(savedScrollY)
                        ? savedScrollY
                        : 0,
                    left: 0,
                    behavior: "auto",
                });
            });
        });
    }, []);

    return {
        view: route.view,
        selectedWorkId:
            route.selectedWorkId,

        goHome,
        goList,
        goToWork,
        backToList,
    };
}