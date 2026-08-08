// src/components/works/WorkListToolbar.jsx

import {
    useRef,
} from "react";

import {
    ArrowUpDown,
    ChevronDown,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import SortMenu from "./SortMenu";

import {
    useClickOutside,
} from "../../hooks/useClickOutside";

export default function WorkListToolbar({
    activeTab,

    searchInput,
    onSearchInputChange,
    onSearch,

    sortKey,
    sortDir,
    sortMenuOpen,
    onToggleSortMenu,
    onCloseSortMenu,
    onSortKeyChange,
    onSortDirChange,

    onOpenFilter,
}) {
    const sortMenuRef = useRef(null);

    useClickOutside(
        sortMenuRef,
        sortMenuOpen,
        onCloseSortMenu
    );

    function handleKeyDown(event) {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        onSearch();
    }

    return (
        <div className="sticky top-[102px] z-20 bg-slate-950/70 backdrop-blur-md">
            <div className="px-4 py-3">
                <div className="mx-auto flex max-w-6xl items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(event) =>
                                onSearchInputChange(
                                    event.target.value
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                            placeholder="以+-篩選或排除關鍵字"
                            className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
                        />

                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={onSearch}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
                    >
                        <Search size={16} />
                        搜尋
                    </button>

                    <button
                        type="button"
                        onClick={onOpenFilter}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/70"
                    >
                        <SlidersHorizontal
                            size={16}
                        />
                        進階
                    </button>

                    <div
                        ref={sortMenuRef}
                        className="relative"
                    >
                        <button
                            type="button"
                            onClick={
                                onToggleSortMenu
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/70"
                        >
                            <ArrowUpDown
                                size={16}
                            />

                            排序

                            <ChevronDown
                                size={16}
                                className="opacity-70"
                            />
                        </button>

                        {sortMenuOpen && (
                            <SortMenu
                                activeTab={
                                    activeTab
                                }
                                sortKey={
                                    sortKey
                                }
                                sortDir={
                                    sortDir
                                }
                                onSortKeyChange={
                                    onSortKeyChange
                                }
                                onSortDirChange={
                                    onSortDirChange
                                }
                                onClose={
                                    onCloseSortMenu
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}