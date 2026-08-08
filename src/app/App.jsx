// src/app/App.jsx

import {
    useMemo,
    useState,
} from "react";

import AboutModal from "../components/about/AboutModal";

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
    const [
        aboutOpen,
        setAboutOpen,
    ] = useState(false);

    const openAbout = () => {
        setAboutOpen(true);
    };

    const closeAbout = () => {
        setAboutOpen(false);
    };

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

    let page;

    if (view === "home") {
        page = (
            <HomePage
                error={error}
                onOpenList={goList}
                onOpenAbout={() =>
                    setAboutOpen(true)
                }
            />
        );
    } else if (
        loading &&
        works.length === 0
    ) {
        page = <LoadingScreen />;
    } else if (
        view === "detail"
    ) {
        page = (
            <WorkDetailPage
                work={selectedWork}
                works={works}
                tagMap={tagMap}
                genreCountMap={
                    genreCountMap
                }
                onBack={backToList}
                onOpenAbout={() =>
                    setAboutOpen(true)
                }
            />
        );
    } else {
        page = (
            <WorkListPage
                works={works}
                tagMap={tagMap}
                error={error}
                onBack={goHome}
                onSelectWork={
                    goToWork
                }
                onOpenAbout={() =>
                    setAboutOpen(true)
                }
            />
        );
    }

    return (
        <>
            {page}

            <AboutModal
                open={aboutOpen}
                onClose={() =>
                    setAboutOpen(false)
                }
            />
        </>
    );
}