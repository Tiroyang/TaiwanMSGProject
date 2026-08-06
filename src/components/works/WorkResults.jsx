// src/components/works/WorkResults.jsx

import WorkGridCard from "./WorkGridCard";
import WorkListItem from "./WorkListItem";

export default function WorkResults({
    works,
    displayMode,
    hoveredWorkId,
    tagMap,
    genreCountMap,
    onHoveredWorkChange,
    onSelectWork,
}) {
    if (!works.length) {
        return (
            <div className="py-16 text-center text-sm text-slate-500">
                沒有符合條件的作品。
            </div>
        );
    }

    const isGrid =
        displayMode === "grid";

    return (
        <main className="mx-auto max-w-6xl p-4">
            <div
                className={
                    isGrid
                        ? "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]"
                        : "flex flex-col gap-3"
                }
            >
                {works.map((work) =>
                    isGrid ? (
                        <WorkGridCard
                            key={work.id}
                            work={work}
                            active={
                                hoveredWorkId ===
                                work.id
                            }
                            tagMap={tagMap}
                            genreCountMap={
                                genreCountMap
                            }
                            onMouseEnter={() =>
                                onHoveredWorkChange(
                                    work.id
                                )
                            }
                            onMouseLeave={() =>
                                onHoveredWorkChange(
                                    null
                                )
                            }
                            onClick={() =>
                                onSelectWork(
                                    work.id
                                )
                            }
                        />
                    ) : (
                        <WorkListItem
                            key={work.id}
                            work={work}
                            onClick={() =>
                                onSelectWork(
                                    work.id
                                )
                            }
                        />
                    )
                )}
            </div>
        </main>
    );
}