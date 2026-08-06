// src/components/filters/FilterModal.jsx

import {
    useCallback,
    useEffect,
    useMemo,
} from "react";

import { createPortal } from "react-dom";

import {
    Calendar,
    X,
} from "lucide-react";

import {
    normalizeDateText,
    toNativeDateValue,
} from "../../utils/dates";

import {
    getTagTitle,
    getTagView,
} from "../../utils/tags";

import {
    sortByCurrentKeepZeroOrder,
} from "../../utils/sorting";

import {
    deriveCountryUi,
    deriveGenreUi,
    nextCountryFiltersByPreset,
} from "../../utils/filters";

/* 共用小元件 */
function SectionHeader({
    title,
    onClear,
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-teal-500">
                {title}
            </h3>

            <button
                type="button"
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
            >
                取消
            </button>
        </div>
    );
}

function Pill({
    active,
    tri,
    children,
    onClick,
    onDoubleClick,
    title,
}) {
    const className = [
        "px-2 py-1 text-xs rounded-lg border transition select-none",
        "whitespace-nowrap",

        active
            ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
            : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",

        tri === "force"
            ? "font-bold ring-2 ring-emerald-400/80"
            : "",

        tri === "hide"
            ? "opacity-50 line-through"
            : "",
    ].join(" ");

    const defaultTitle =
        tri === "force"
            ? "強制顯示"
            : tri === "hide"
                ? "隱藏"
                : "顯示";

    return (
        <button
            type="button"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            className={className}
            title={title || defaultTitle}
        >
            {children}
        </button>
    );
}

function Segmented({
    value,
    onChange,
    options,
    size = "sm",
}) {
    const padding =
        size === "sm"
            ? "px-3 py-2 text-sm"
            : "px-4 py-2 text-base";

    return (
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            {options.map((option, index) => {
                const active =
                    value === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                            onChange(option.value)
                        }
                        className={[
                            "flex-1 transition",
                            padding,

                            index !== 0
                                ? "border-l border-slate-800"
                                : "",

                            active
                                ? "bg-sky-600/20 text-sky-200"
                                : "text-slate-200 hover:bg-slate-800/50",
                        ].join(" ")}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

/* FilterModal 需要的語言輔助函式 */
function updateLangBranch(
    filters,
    langKey,
    branch,
    nextHidden,
    allNamesLength
) {
    const allHidden =
        allNamesLength > 0 &&
        nextHidden.size === allNamesLength;

    const noneHidden =
        nextHidden.size === 0;

    const preset = allHidden
        ? "none"
        : noneHidden
            ? "all"
            : "custom";

    return {
        ...filters,

        [langKey]: {
            ...filters[langKey],

            hidden: {
                ...filters[langKey].hidden,
                [branch]: nextHidden,
            },

            preset: {
                ...filters[langKey].preset,
                [branch]: preset,
            },
        },
    };
}

function setLangPreset(
    setTempFilters,
    langKey,
    branch,
    mode,
    allNames
) {
    setTempFilters((filters) => {
        const nextHidden =
            mode === "all"
                ? new Set()
                : new Set(allNames);

        return {
            ...filters,

            [langKey]: {
                ...filters[langKey],

                hidden: {
                    ...filters[langKey].hidden,
                    [branch]: nextHidden,
                },

                preset: {
                    ...filters[langKey].preset,
                    [branch]: mode,
                },
            },
        };
    });
}

function toggleLangHidden(
    setTempFilters,
    langKey,
    branch,
    name,
    allNames
) {
    setTempFilters((filters) => {
        const currentHidden =
            filters[langKey].hidden[branch] ??
            new Set();

        const nextHidden =
            new Set(currentHidden);

        if (nextHidden.has(name)) {
            nextHidden.delete(name);
        } else {
            nextHidden.add(name);
        }

        return updateLangBranch(
            filters,
            langKey,
            branch,
            nextHidden,
            allNames.length
        );
    });
}

function buildTriMapShowAll() {
    return new Map();
}

function buildTriMapHideAll(names) {
    const map = new Map();

    for (const name of names) {
        map.set(name, "hide");
    }

    return map;
}

/* 主體 */
export default function FilterModal({
    open,
    onClose,

    statusCounts = [],
    countryCounts = [],
    genreCounts = [],
    langCounts = {
        mv: {},
        gm: {},
    },

    tagMap = new Map(),
    lang = "zh",

    tempFilters,
    setTempFilters,

    dateFormatWarning = false,
    onResetAll,
    onApply,
    onConfirm,
}) {
    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        const previousHtmlOverflow =
            document.documentElement.style.overflow;

        const previousBodyOverflow =
            document.body.style.overflow;

        document.documentElement.style.overflow =
            "hidden";

        document.body.style.overflow =
            "hidden";

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.documentElement.style.overflow =
                previousHtmlOverflow;

            document.body.style.overflow =
                previousBodyOverflow;
        };
    }, [open, onClose]);

    const countryCountsSorted = useMemo(
        () =>
            sortByCurrentKeepZeroOrder(
                countryCounts
            ),
        [countryCounts]
    );

    const genreCountsSorted = useMemo(
        () =>
            sortByCurrentKeepZeroOrder(
                genreCounts
            ),
        [genreCounts]
    );

    const countryNames = useMemo(
        () =>
            countryCounts.map(
                (item) => item.name
            ),
        [countryCounts]
    );

    const countryUi = useMemo(
        () =>
            deriveCountryUi(
                tempFilters.countryTri,
                countryNames,
                tempFilters.countryCoMode
            ),
        [
            tempFilters.countryTri,
            tempFilters.countryCoMode,
            countryNames,
        ]
    );

    const applyCountryPreset =
        useCallback(
            (presetKey) => {
                setTempFilters((filters) =>
                    nextCountryFiltersByPreset(
                        filters,
                        presetKey,
                        countryNames
                    )
                );
            },
            [
                setTempFilters,
                countryNames,
            ]
        );

    useEffect(() => {
        if (
            !open ||
            !tempFilters.countryCoMode
        ) {
            return;
        }

        if (countryUi.coInvalid) {
            setTempFilters((filters) => ({
                ...filters,
                countryCoMode: false,
                countryPreset: "none",
            }));
        }
    }, [
        open,
        countryUi.coInvalid,
        tempFilters.countryCoMode,
        setTempFilters,
    ]);

    const sortedLangCounts = useMemo(() => {
        const result = {
            mv: {},
            gm: {},
        };

        for (const type of ["mv", "gm"]) {
            const branches =
                langCounts?.[type] || {};

            for (const branch of Object.keys(
                branches
            )) {
                result[type][branch] =
                    sortByCurrentKeepZeroOrder(
                        branches[branch]
                    );
            }
        }

        return result;
    }, [langCounts]);

    if (!open) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
                    <div className="text-white font-bold">
                        進階過濾
                    </div>

                    <div className="flex items-center gap-2">
                        {dateFormatWarning && (
                            <span className="text-red-400 text-xs font-semibold">
                                請填入正確的日期格式！
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={onResetAll}
                            className="h-9 px-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 text-slate-100 text-sm transition"
                        >
                            全部取消
                        </button>

                        <button
                            type="button"
                            onClick={onApply}
                            className="h-9 px-3 rounded-xl bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold transition"
                        >
                            套用
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            className="h-9 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition"
                        >
                            確定
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 text-slate-100 transition"
                            title="關閉"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </header>

                <div className="p-4 overflow-auto max-h-[calc(85vh-56px)] space-y-6">
                    <TypeFilterSection
                        filters={tempFilters}
                        setFilters={setTempFilters}
                    />

                    <StatusFilterSection
                        statusCounts={statusCounts}
                        filters={tempFilters}
                        setFilters={setTempFilters}
                    />

                    <DateFilterSection
                        filters={tempFilters}
                        setFilters={setTempFilters}
                    />

                    <CountryFilterSection
                        countryCounts={
                            countryCountsSorted
                        }
                        countryUi={countryUi}
                        onPresetChange={
                            applyCountryPreset
                        }
                        filters={tempFilters}
                        setFilters={setTempFilters}
                    />

                    <GenreFilterSection
                        genreCounts={
                            genreCountsSorted
                        }
                        tagMap={tagMap}
                        lang={lang}
                        filters={tempFilters}
                        setFilters={setTempFilters}
                    />

                    <LanguageFilterSection
                        langCounts={sortedLangCounts}
                        filters={tempFilters}
                        setFilters={setTempFilters}
                    />

                    <ImageFilterSection
                        filters={tempFilters}
                        setFilters={setTempFilters}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}

/* 類別篩選區塊 */
function TypeFilterSection({
    filters,
    setFilters,
}) {
    const options = [
        ["movies", "隱藏電影"],
        ["series", "隱藏影集"],
        ["games", "隱藏遊戲"],
    ];

    return (
        <section className="space-y-3">
            <SectionHeader
                title="類別"
                onClear={() => {
                    setFilters((current) => ({
                        ...current,
                        hideTypes: {
                            movies: false,
                            series: false,
                            games: false,
                        },
                    }));
                }}
            />

            <div className="flex flex-wrap gap-2">
                {options.map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => {
                            setFilters((current) => ({
                                ...current,

                                hideTypes: {
                                    ...current.hideTypes,

                                    [key]:
                                        !current.hideTypes[key],
                                },
                            }));
                        }}
                        className={[
                            "px-3 py-2 rounded-xl border text-sm transition",

                            filters.hideTypes[key]
                                ? "bg-red-600/15 border-red-500/30 text-red-200"
                                : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </section>
    );
}

/* 狀態篩選區塊 */
function StatusFilterSection({
    statusCounts,
    filters,
    setFilters,
}) {
    return (
        <section className="space-y-3">
            <SectionHeader
                title="狀態"
                onClear={() => {
                    setFilters((current) => ({
                        ...current,
                        statusMode: "all",
                        statusHidden: new Set(),
                    }));
                }}
            />

            <div className="flex flex-wrap gap-2 text-xs">
                <button
                    type="button"
                    onClick={() => {
                        setFilters((current) => ({
                            ...current,
                            statusMode: "all",
                            statusHidden: new Set(),
                        }));
                    }}
                    className={[
                        "px-3 py-2 rounded-xl border transition",

                        filters.statusMode === "all"
                            ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                            : "bg-slate-900/40 border-slate-800 text-slate-200",
                    ].join(" ")}
                >
                    全選
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setFilters((current) => ({
                            ...current,
                            statusMode: "none",

                            statusHidden: new Set(
                                statusCounts.map(
                                    (item) => item.name
                                )
                            ),
                        }));
                    }}
                    className={[
                        "px-3 py-2 rounded-xl border transition",

                        filters.statusMode === "none"
                            ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                            : "bg-slate-900/40 border-slate-800 text-slate-200",
                    ].join(" ")}
                >
                    全不選
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {statusCounts.map((item) => {
                    const hidden =
                        filters.statusHidden.has(
                            item.name
                        );

                    return (
                        <Pill
                            key={item.name}
                            active={!hidden}
                            tri={
                                hidden
                                    ? "hide"
                                    : "show"
                            }
                            onClick={() => {
                                setFilters((current) => {
                                    const nextHidden =
                                        new Set(
                                            current.statusHidden
                                        );

                                    if (
                                        nextHidden.has(
                                            item.name
                                        )
                                    ) {
                                        nextHidden.delete(
                                            item.name
                                        );
                                    } else {
                                        nextHidden.add(
                                            item.name
                                        );
                                    }

                                    const allHidden =
                                        nextHidden.size ===
                                        statusCounts.length;

                                    const noneHidden =
                                        nextHidden.size === 0;

                                    return {
                                        ...current,

                                        statusHidden:
                                            nextHidden,

                                        statusMode: allHidden
                                            ? "none"
                                            : noneHidden
                                                ? "all"
                                                : "custom",
                                    };
                                });
                            }}
                        >
                            {item.name} ({item.current}/
                            {item.total})
                        </Pill>
                    );
                })}
            </div>
        </section>
    );
}

/* 日期篩選區塊 */
function DateFilterSection({
    filters,
    setFilters,
}) {
    return (
        <section className="space-y-3">
            <SectionHeader
                title="發布日期"
                onClear={() => {
                    setFilters((current) => ({
                        ...current,

                        dateRange: {
                            start: "",
                            end: "",
                            hideNoDate: false,
                        },
                    }));
                }}
            />

            <div className="flex flex-col sm:flex-row items-center gap-2">
                <DateInput
                    placeholder="開始日期 YYYY/MM/DD"
                    value={filters.dateRange.start}
                    onChange={(value) => {
                        setFilters((current) => ({
                            ...current,

                            dateRange: {
                                ...current.dateRange,
                                start: value,
                            },
                        }));
                    }}
                />

                <span className="text-slate-400">
                    ~
                </span>

                <DateInput
                    placeholder="結束日期 YYYY/MM/DD"
                    value={filters.dateRange.end}
                    onChange={(value) => {
                        setFilters((current) => ({
                            ...current,

                            dateRange: {
                                ...current.dateRange,
                                end: value,
                            },
                        }));
                    }}
                />
            </div>

            <label className="px-3 text-xs text-slate-200 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={
                        filters.dateRange.hideNoDate
                    }
                    onChange={(event) => {
                        setFilters((current) => ({
                            ...current,

                            dateRange: {
                                ...current.dateRange,

                                hideNoDate:
                                    event.target.checked,
                            },
                        }));
                    }}
                />

                隱藏無發布日期
            </label>
        </section>
    );
}

function DateInput({
    placeholder,
    value,
    onChange,
}) {
    return (
        <div className="relative w-full flex-1">
            <input
                className="h-10 w-full rounded-xl bg-slate-900/50 border border-slate-800 px-3 pr-10 text-sm text-slate-100 outline-none focus:border-sky-500/60"
                placeholder={placeholder}
                value={value}
                onChange={(event) => {
                    onChange(
                        normalizeDateText(
                            event.target.value
                        )
                    );
                }}
            />

            <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 flex items-center justify-center">
                <Calendar
                    size={16}
                    className="text-slate-300 pointer-events-none"
                />

                <input
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    value={toNativeDateValue(value)}
                    onChange={(event) => {
                        onChange(event.target.value);
                    }}
                />
            </div>
        </div>
    );
}

/* 國家篩選區塊 */
function CountryFilterSection({
    countryCounts,
    countryUi,
    onPresetChange,
    filters,
    setFilters,
}) {
    return (
        <section className="space-y-3">
            <SectionHeader
                title="製作地區"
                onClear={() => {
                    setFilters((current) => ({
                        ...current,
                        countryTri: new Map(),
                        countryPreset: "none",
                        countryCoMode: false,
                    }));
                }}
            />

            <div className="flex flex-wrap gap-2 text-xs">
                {[
                    ["showAll", "全選"],
                    ["hideAll", "全不選"],
                    ["foreign", "外國製作"],
                    ["co", "國際合作"],
                    ["local", "本土製作"],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() =>
                            onPresetChange(key)
                        }
                        className={[
                            "px-3 py-2 rounded-xl border transition",

                            countryUi.presetUi === key
                                ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {countryUi.hintEnabled &&
                countryUi.hint && (
                    <div className="text-xs text-slate-400 -mt-1">
                        {countryUi.hint}
                    </div>
                )}

            <div className="flex flex-wrap gap-2">
                {countryCounts.map((item) => {
                    const tri =
                        filters.countryTri.get(
                            item.name
                        ) || "show";

                    return (
                        <Pill
                            key={item.name}
                            active={tri !== "hide"}
                            tri={tri}
                            onClick={() => {
                                setFilters((current) => {
                                    const next = new Map(
                                        current.countryTri
                                    );

                                    const currentValue =
                                        next.get(item.name) ||
                                        "show";

                                    next.set(
                                        item.name,
                                        currentValue === "hide"
                                            ? "show"
                                            : "hide"
                                    );

                                    return {
                                        ...current,
                                        countryTri: next,
                                        countryPreset:
                                            "custom",
                                    };
                                });
                            }}
                            onDoubleClick={() => {
                                setFilters((current) => {
                                    const next = new Map(
                                        current.countryTri
                                    );

                                    next.set(
                                        item.name,
                                        "force"
                                    );

                                    return {
                                        ...current,
                                        countryTri: next,
                                        countryPreset:
                                            "custom",
                                    };
                                });
                            }}
                        >
                            {item.name} ({item.current}/
                            {item.total})
                        </Pill>
                    );
                })}
            </div>
        </section>
    );
}

/* 類型篩選區塊 */
function GenreFilterSection({
    genreCounts,
    tagMap,
    lang,
    filters,
    setFilters,
}) {
    const names = genreCounts.map(
        (item) => item.name
    );

    const ui = deriveGenreUi(
        filters.genreTri,
        names
    );

    const adultTri =
        filters.genreTri.get("成人") ||
        "show";

    return (
        <section className="space-y-3">
            <SectionHeader
                title="類型"
                onClear={() => {
                    setFilters((current) => ({
                        ...current,
                        genreTri: new Map(),
                    }));
                }}
            />

            <div className="flex flex-wrap gap-2 text-xs">
                {[
                    ["showAll", "全選"],
                    ["hideAll", "全不選"],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => {
                            setFilters((current) => ({
                                ...current,

                                genreTri:
                                    key === "showAll"
                                        ? buildTriMapShowAll()
                                        : buildTriMapHideAll(
                                            names
                                        ),
                            }));
                        }}
                        className={[
                            "px-3 py-2 rounded-xl border transition",

                            ui.presetUi === key
                                ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                : "bg-slate-900/40 border-slate-800 text-slate-200",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <label className="px-3 text-xs text-slate-200 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={adultTri === "hide"}
                    onChange={(event) => {
                        setFilters((current) => {
                            const next = new Map(
                                current.genreTri
                            );

                            if (event.target.checked) {
                                next.set("成人", "hide");
                            } else {
                                next.delete("成人");
                            }

                            return {
                                ...current,
                                genreTri: next,
                            };
                        });
                    }}
                />

                隱藏「成人」類型作品
            </label>

            <div className="flex flex-wrap gap-2">
                {genreCounts.map((item) => {
                    const tri =
                        filters.genreTri.get(
                            item.name
                        ) || "show";

                    return (
                        <Pill
                            key={item.name}
                            active={tri !== "hide"}
                            tri={tri}
                            title={getTagTitle(
                                item.name,
                                tagMap,
                                lang
                            )}
                            onClick={() => {
                                setFilters((current) => {
                                    const next = new Map(
                                        current.genreTri
                                    );

                                    const currentValue =
                                        next.get(item.name) ||
                                        "show";

                                    if (
                                        currentValue === "hide"
                                    ) {
                                        next.delete(item.name);
                                    } else {
                                        next.set(
                                            item.name,
                                            "hide"
                                        );
                                    }

                                    return {
                                        ...current,
                                        genreTri: next,
                                    };
                                });
                            }}
                            onDoubleClick={() => {
                                setFilters((current) => {
                                    const next = new Map(
                                        current.genreTri
                                    );

                                    next.set(
                                        item.name,
                                        "force"
                                    );

                                    return {
                                        ...current,
                                        genreTri: next,
                                    };
                                });
                            }}
                        >
                            {getTagView(
                                item.name,
                                tagMap,
                                lang
                            ).label}{" "}
                            ({item.current}/{item.total})
                        </Pill>
                    );
                })}
            </div>
        </section>
    );
}

/* 語言篩選區塊 */
function LanguageFilterSection({
    langCounts,
    filters,
    setFilters,
}) {
    return (
        <section className="space-y-3">
            <SectionHeader
                title="支援語言"
                onClear={() => {
                    setFilters((current) => ({
                        ...current,

                        langMode: "none",

                        langMV: {
                            active: "orig",

                            hidden: {
                                orig: new Set(),
                                dub: new Set(),
                                sub: new Set(),
                            },

                            preset: {
                                orig: "all",
                                dub: "all",
                                sub: "all",
                            },
                        },

                        langGM: {
                            active: "sub",

                            hidden: {
                                sub: new Set(),
                                voice: new Set(),
                                ui: new Set(),
                            },

                            preset: {
                                sub: "all",
                                voice: "all",
                                ui: "all",
                            },
                        },
                    }));
                }}
            />

            <Segmented
                value={filters.langMode}
                onChange={(value) => {
                    setFilters((current) => ({
                        ...current,
                        langMode: value,
                    }));
                }}
                options={[
                    {
                        value: "mv",
                        label: "電影／影集",
                    },
                    {
                        value: "gm",
                        label: "遊戲",
                    },
                ]}
            />

            {filters.langMode === "mv" && (
                <LanguageBranchSection
                    mode="mv"
                    langKey="langMV"
                    branches={[
                        {
                            value: "orig",
                            label: "原音",
                        },
                        {
                            value: "dub",
                            label: "配音",
                        },
                        {
                            value: "sub",
                            label: "字幕",
                        },
                    ]}
                    langCounts={langCounts.mv}
                    filters={filters}
                    setFilters={setFilters}
                />
            )}

            {filters.langMode === "gm" && (
                <LanguageBranchSection
                    mode="gm"
                    langKey="langGM"
                    branches={[
                        {
                            value: "sub",
                            label: "字幕",
                        },
                        {
                            value: "voice",
                            label: "語音",
                        },
                        {
                            value: "ui",
                            label: "介面",
                        },
                    ]}
                    langCounts={langCounts.gm}
                    filters={filters}
                    setFilters={setFilters}
                />
            )}
        </section>
    );
}

function LanguageBranchSection({
    langKey,
    branches,
    langCounts,
    filters,
    setFilters,
}) {
    const branch =
        filters[langKey].active;

    const list =
        langCounts?.[branch] || [];

    const hiddenSet =
        filters[langKey].hidden[branch] ||
        new Set();

    const allNames = list.map(
        (item) => item.name
    );

    return (
        <div className="space-y-3">
            <Segmented
                value={branch}
                onChange={(value) => {
                    setFilters((current) => ({
                        ...current,

                        [langKey]: {
                            ...current[langKey],
                            active: value,
                        },
                    }));
                }}
                options={branches}
            />

            <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => {
                            setLangPreset(
                                setFilters,
                                langKey,
                                branch,
                                "all",
                                allNames
                            );
                        }}
                        className={[
                            "px-3 py-2 rounded-xl border transition",

                            filters[langKey].preset[
                                branch
                            ] === "all"
                                ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                : "bg-slate-900/40 border-slate-800 text-slate-200",
                        ].join(" ")}
                    >
                        全選
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setLangPreset(
                                setFilters,
                                langKey,
                                branch,
                                "none",
                                allNames
                            );
                        }}
                        className={[
                            "px-3 py-2 rounded-xl border transition",

                            filters[langKey].preset[
                                branch
                            ] === "none"
                                ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                : "bg-slate-900/40 border-slate-800 text-slate-200",
                        ].join(" ")}
                    >
                        全不選
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {list.map((item) => {
                        const hidden =
                            hiddenSet.has(item.name);

                        return (
                            <Pill
                                key={item.name}
                                active={!hidden}
                                tri={
                                    hidden
                                        ? "hide"
                                        : "show"
                                }
                                onClick={() => {
                                    toggleLangHidden(
                                        setFilters,
                                        langKey,
                                        branch,
                                        item.name,
                                        allNames
                                    );
                                }}
                            >
                                {item.name} ({item.current}/
                                {item.total})
                            </Pill>
                        );
                    })}

                    {list.length === 0 && (
                        <div className="text-sm text-slate-500">
                            （沒有可顯示的資料）
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* 主視覺圖篩選 */
function ImageFilterSection({
    filters,
    setFilters,
}) {
    return (
        <section className="space-y-3">
            <SectionHeader
                title="主視覺圖"
                onClear={() => {
                    setFilters((current) => ({
                        ...current,
                        hideNoMainImage: false,
                    }));
                }}
            />

            <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                <input
                    type="checkbox"
                    checked={
                        filters.hideNoMainImage
                    }
                    onChange={(event) => {
                        setFilters((current) => ({
                            ...current,

                            hideNoMainImage:
                                event.target.checked,
                        }));
                    }}
                />

                隱藏不含主視覺圖的作品
            </label>
        </section>
    );
}