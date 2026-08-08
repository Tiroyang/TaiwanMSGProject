// src/components/works/SortMenu.jsx

const COMMON_SORT_OPTIONS = [
    [
        "release_date_simp",
        "發布日期",
    ],
    [
        "id",
        "編號",
    ],
    [
        "name",
        "名稱",
    ],
];

const LAST_UPDATE_OPTION = [
    "last_update",
    "上次更新時間",
];

function getSortOptions(
    activeTab
) {
    if (activeTab === "series") {
        return [
            ...COMMON_SORT_OPTIONS,

            [
                "episode_total_count",
                "總集數",
            ],

            [
                "runtime",
                "片長",
            ],

            LAST_UPDATE_OPTION,
        ];
    }

    if (activeTab === "movies") {
        return [
            ...COMMON_SORT_OPTIONS,

            [
                "runtime",
                "片長",
            ],

            LAST_UPDATE_OPTION,
        ];
    }

    return [
        ...COMMON_SORT_OPTIONS,
        LAST_UPDATE_OPTION,
    ];
}

const SORT_DIRECTIONS = [
    ["asc", "遞增"],
    ["desc", "遞減"],
];

export default function SortMenu({
    activeTab,
    sortKey,
    sortDir,
    onSortKeyChange,
    onSortDirChange,
    onClose,
}) {
    const options =
        getSortOptions(activeTab);

    return (
        <div className="absolute right-0 z-50 mt-2 w-[280px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950/95 shadow-xl backdrop-blur">
            <div className="border-b border-slate-800 p-3">
                <div className="mb-2 text-xs text-slate-400">
                    排序欄位
                </div>

                <div className="grid grid-cols-1 gap-1">
                    {options.map(
                        ([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() =>
                                    onSortKeyChange(key)
                                }
                                className={[
                                    "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                                    "hover:bg-slate-800/60",
                                    sortKey === key
                                        ? "bg-slate-800/70 text-white"
                                        : "text-slate-200",
                                ].join(" ")}
                            >
                                {label}
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="p-3">
                <div className="mb-2 text-xs text-slate-400">
                    遞增／遞減
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {SORT_DIRECTIONS.map(
                        ([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() =>
                                    onSortDirChange(value)
                                }
                                className={[
                                    "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                                    "border-slate-800 hover:bg-slate-800/60",
                                    sortDir === value
                                        ? "border-sky-500/40 bg-sky-600/20 text-sky-200"
                                        : "text-slate-200",
                                ].join(" ")}
                            >
                                {label}
                            </button>
                        )
                    )}
                </div>

                <div className="mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs text-slate-400 transition hover:text-slate-200"
                    >
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
}