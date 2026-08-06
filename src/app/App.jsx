// src/app/App.jsx

import { useMemo } from "react";

import HomePage from "../pages/HomePage";
import WorkDetailPage from "../pages/WorkDetailPage";
import WorkListPage from "../pages/WorkListPage";

import LoadingScreen from "../components/common/LoadingScreen";

import { useHashRouter } from "../hooks/useHashRouter";
import { useWorks } from "../hooks/useWorks";

import {
    buildGenreCountMap,
} from "../utils/counts";

export default function App() {
    const {
        view,
        selectedWorkId,
        goHome,
        goList,
        goToWork,
        backToList,
    } = useHashRouter();

    const {
        works,
        tagMap,
        loading,
        error,
    } = useWorks({
        enabled: view !== "home",
    });

    const selectedWork = useMemo(() => {
        if (!selectedWorkId) {
            return null;
        }

        return (
            works.find(
                (work) =>
                    String(work.id) ===
                    String(selectedWorkId)
            ) ?? null
        );
    }, [works, selectedWorkId]);

    const genreCountMap = useMemo(
        () => buildGenreCountMap(works),
        [works]
    );

    if (view === "home") {
        return (
            <HomePage
                error={error}
                onOpenList={goList}
            />
        );
    }

    if (
        loading &&
        works.length === 0
    ) {
        return <LoadingScreen />;
    }

    if (view === "detail") {
        return (
            <WorkDetailPage
                work={selectedWork}
                works={works}
                tagMap={tagMap}
                genreCountMap={genreCountMap}
                onBack={backToList}
            />
        );
    }

    return (
        <WorkListPage
            works={works}
            tagMap={tagMap}
            error={error}
            onBack={goHome}
            onSelectWork={goToWork}
        />
    );
}