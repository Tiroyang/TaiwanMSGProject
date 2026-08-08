// src/components/works/WorkListHeader.jsx

import {
    Home,
    LayoutGrid,
    List,
} from "lucide-react";

import AboutButton from "../about/AboutButton";

const TAB_TITLES = {
    movies: "電影列表",
    series: "影集列表",
    games: "遊戲列表",
};

export default function WorkListHeader({
    activeTab,
    resultCount,
    displayMode,
    onBack,
    onToggleDisplayMode,
    onOpenAbout,
}) {
    const isGrid =
        displayMode === "grid";

    const title =
        TAB_TITLES[activeTab] ??
        "作品列表";

    return (
        <header className="relative sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 shadow-md backdrop-blur-md">
            <button
                type="button"
                onClick={onBack}
                className="-ml-2 p-2 text-slate-400 transition-colors hover:text-white"
                aria-label="返回首頁"
            >
                <Home />
            </button>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <h2 className="relative whitespace-nowrap text-2xl font-bold text-white">
                    {title}

                    <span className="absolute left-full top-1/2 ml-1 -translate-y-1/2 whitespace-nowrap text-sm font-normal text-slate-400">
                        ({resultCount})
                    </span>
                </h2>
            </div>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={onToggleDisplayMode}
                    className="p-2 text-slate-400 transition-colors hover:text-white"
                    title={
                        isGrid
                            ? "切換為條列"
                            : "切換為方塊"
                    }
                >
                    {isGrid ? (
                        <List size={18} />
                    ) : (
                        <LayoutGrid size={18} />
                    )}
                </button>

                <AboutButton
                    onClick={onOpenAbout}
                />
            </div>
        </header>
    );
}