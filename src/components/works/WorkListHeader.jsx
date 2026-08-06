// src/components/works/WorkListHeader.jsx

import {
    Home,
    LayoutGrid,
    List,
} from "lucide-react";

export default function WorkListHeader({
    resultCount,
    displayMode,
    onBack,
    onToggleDisplayMode,
}) {
    const isGrid =
        displayMode === "grid";

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 shadow-md backdrop-blur-md">
            <button
                type="button"
                onClick={onBack}
                className="-ml-2 p-2 text-slate-400 transition-colors hover:text-white"
                aria-label="返回首頁"
            >
                <Home />
            </button>

            <h2 className="text-lg font-bold text-white">
                作品列表 ({resultCount})
            </h2>

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
        </header>
    );
}