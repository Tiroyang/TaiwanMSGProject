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

/* 主體 */
export default function FilterModal({
    activeTab,

    open,
    onClose,

    statusCounts = [],
    countryCounts = [],
    genreCounts = [],
    pricingModelCounts = [],
    langCounts = {
        mv: {},
        gm: {},
    },

    tagMap = new Map(),
    lang = "zh",

    tempFilters,
    dispatch,

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
                const nextFilters =
                    nextCountryFiltersByPreset(
                        tempFilters,
                        presetKey,
                        countryNames
                    );

                dispatch({
                    type: "REPLACE",
                    value: nextFilters,
                });
            },
            [
                tempFilters,
                countryNames,
                dispatch,
            ]
        );

    useEffect(() => {
        if (
            !open ||
            !tempFilters.countryCoMode
        ) {
            return;
        }

        if (!countryUi.coInvalid) {
            return;
        }

        dispatch({
            type: "SET_COUNTRY_STATE",

            countryTri:
                tempFilters.countryTri,

            countryPreset: "none",

            countryCoMode: false,
        });
    }, [
        open,
        countryUi.coInvalid,
        tempFilters.countryCoMode,
        tempFilters.countryTri,
        dispatch,
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
                    <StatusFilterSection
                        statusCounts={statusCounts}
                        filters={tempFilters}
                        dispatch={dispatch}
                    />

                    <DateFilterSection
                        filters={tempFilters}
                        dispatch={dispatch}
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
                        dispatch={dispatch}
                        activeTab={activeTab}
                    />

                    <GenreFilterSection
                        genreCounts={
                            genreCountsSorted
                        }
                        tagMap={tagMap}
                        lang={lang}
                        filters={tempFilters}
                        dispatch={dispatch}
                    />

                    {activeTab === "games" && (
                        <PricingModelFilterSection
                            pricingModelCounts={
                                pricingModelCounts
                            }
                            filters={tempFilters}
                            dispatch={dispatch}
                        />
                    )}

                    <LanguageFilterSection
                        activeTab={activeTab}
                        langCounts={sortedLangCounts}
                        filters={tempFilters}
                        dispatch={dispatch}
                    />

                    <ImageFilterSection
                        filters={tempFilters}
                        dispatch={dispatch}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}

/* 狀態篩選區塊 */
function StatusFilterSection({
    statusCounts,
    filters,
    dispatch,
}) {
    return (
        <section className="space-y-3">
            <SectionHeader
                title="狀態"
                onClear={() => {
                    dispatch({
                        type: "SET_STATUS_ALL",
                    });
                }}
            />

            <div className="flex flex-wrap gap-2 text-xs">
                <button
                    type="button"
                    onClick={() => {
                        dispatch({
                            type: "SET_STATUS_ALL",
                        });
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
                        dispatch({
                            type: "SET_STATUS_NONE",

                            names: statusCounts.map(
                                (item) => item.name
                            ),
                        });
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
                                dispatch({
                                    type: "TOGGLE_STATUS",
                                    status: item.name,
                                    totalCount:
                                        statusCounts.length,
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
    dispatch,
}) {
    return (
        <section className="space-y-3">
            <SectionHeader
                title="發布日期"
                onClear={() => {
                    dispatch({
                        type: "RESET_DATE",
                    });
                }}
            />

            <div className="flex flex-col sm:flex-row items-center gap-2">
                <DateInput
                    placeholder="開始日期 YYYY/MM/DD"
                    value={filters.dateRange.start}
                    onChange={(value) => {
                        dispatch({
                            type: "SET_DATE_START",
                            value,
                        });
                    }}
                />

                <span className="text-slate-400">
                    ~
                </span>

                <DateInput
                    placeholder="結束日期 YYYY/MM/DD"
                    value={filters.dateRange.end}
                    onChange={(value) => {
                        dispatch({
                            type: "SET_DATE_END",
                            value,
                        });
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
                        dispatch({
                            type: "SET_HIDE_NO_DATE",
                            value: event.target.checked,
                        });
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
    dispatch,
    activeTab,
}) {
    const isGame =
        activeTab === "games";

    return (
        <section className="space-y-3">
            <SectionHeader
                title="製作地區"
                onClear={() => {
                    dispatch({
                        type: "RESET_COUNTRY",
                    });
                }}
            />
            {!isGame && (
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
                            onClick={() => onPresetChange(key)}
                            className={`px-3 py-2 rounded-xl border transition ${countryUi.presetUi === key
                                    ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                    : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}


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
                                const nextValue =
                                    tri === "hide"
                                        ? "show"
                                        : "hide";

                                dispatch({
                                    type: "SET_COUNTRY_TRI",
                                    name: item.name,
                                    value: nextValue,
                                });
                            }}
                            onDoubleClick={() => {
                                dispatch({
                                    type: "SET_COUNTRY_TRI",
                                    name: item.name,
                                    value: "force",
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
    dispatch,
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
                    dispatch({
                        type: "RESET_GENRE",
                    });
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
                            if (key === "showAll") {
                                dispatch({
                                    type: "SET_GENRE_ALL",
                                });

                                return;
                            }

                            dispatch({
                                type: "SET_GENRE_NONE",
                                names,
                            });
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
                    checked={
                        adultTri === "hide"
                    }
                    onChange={(event) => {
                        dispatch({
                            type: "SET_ADULT_HIDDEN",
                            value:
                                event.target.checked,
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
                            active={
                                tri !== "hide"
                            }
                            tri={tri}
                            title={getTagTitle(
                                item.name,
                                tagMap,
                                lang
                            )}
                            onClick={() => {
                                dispatch({
                                    type: "SET_GENRE_TRI",

                                    name: item.name,

                                    value:
                                        tri === "hide"
                                            ? "show"
                                            : "hide",
                                });
                            }}
                            onDoubleClick={() => {
                                dispatch({
                                    type: "SET_GENRE_TRI",
                                    name: item.name,
                                    value: "force",
                                });
                            }}
                        >
                            {getTagView(
                                item.name,
                                tagMap,
                                lang
                            ).label}{" "}
                            ({item.current}/
                            {item.total})
                        </Pill>
                    );
                })}
            </div>
        </section>
    );
}

function PricingModelFilterSection({
    pricingModelCounts,
    filters,
    dispatch,
}) {
    const names =
        pricingModelCounts.map(
            (item) => item.name
        );

    const triMap =
        filters.pricingModelTri ||
        new Map();

    const allShow =
        names.length > 0 &&
        names.every(
            (name) =>
                (
                    triMap.get(name) ||
                    "show"
                ) === "show"
        );

    const allHide =
        names.length > 0 &&
        names.every(
            (name) =>
                (
                    triMap.get(name) ||
                    "show"
                ) === "hide"
        );

    return (
        <section className="space-y-3">
            <SectionHeader
                title="收費模式"
                onClear={() => {
                    dispatch({
                        type:
                            "RESET_PRICING_MODEL",
                    });
                }}
            />

            <div className="flex flex-wrap gap-2 text-xs">
                <button
                    type="button"
                    onClick={() => {
                        dispatch({
                            type:
                                "SET_PRICING_MODEL_ALL",
                        });
                    }}
                    className={[
                        "px-3 py-2 rounded-xl border transition",

                        allShow
                            ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                            : "bg-slate-900/40 border-slate-800 text-slate-200",
                    ].join(" ")}
                >
                    全選
                </button>

                <button
                    type="button"
                    onClick={() => {
                        dispatch({
                            type:
                                "SET_PRICING_MODEL_NONE",

                            names,
                        });
                    }}
                    className={[
                        "px-3 py-2 rounded-xl border transition",

                        allHide
                            ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                            : "bg-slate-900/40 border-slate-800 text-slate-200",
                    ].join(" ")}
                >
                    全不選
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {pricingModelCounts.map(
                    (item) => {
                        const tri =
                            triMap.get(
                                item.name
                            ) ||
                            "show";

                        return (
                            <Pill
                                key={
                                    item.name
                                }
                                active={
                                    tri !==
                                    "hide"
                                }
                                tri={tri}
                                onClick={() => {
                                    dispatch({
                                        type:
                                            "SET_PRICING_MODEL_TRI",

                                        name:
                                            item.name,

                                        value:
                                            tri ===
                                                "hide"
                                                ? "show"
                                                : "hide",
                                    });
                                }}
                                onDoubleClick={() => {
                                    dispatch({
                                        type:
                                            "SET_PRICING_MODEL_TRI",

                                        name:
                                            item.name,

                                        value:
                                            "force",
                                    });
                                }}
                            >
                                {item.name} (
                                {item.current}/
                                {item.total})
                            </Pill>
                        );
                    }
                )}

                {pricingModelCounts.length ===
                    0 && (
                        <div className="text-sm text-slate-500">
                            （沒有可顯示的資料）
                        </div>
                    )}
            </div>
        </section>
    );
}

/* 語言篩選區塊 */
function LanguageFilterSection({
    activeTab,
    langCounts,
    filters,
    dispatch,
}) {
    const isGame =
        activeTab === "games";

    const langKey =
        isGame
            ? "langGM"
            : "langMV";

    const branches =
        isGame
            ? [
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
            ]
            : [
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
            ];

    const counts =
        isGame
            ? langCounts.gm
            : langCounts.mv;

    return (
        <section className="space-y-3">
            <SectionHeader
                title="支援語言"
                onClear={() => {
                    dispatch({
                        type: "RESET_LANG",
                    });
                }}
            />

            <LanguageBranchSection
                langKey={langKey}
                branches={branches}
                langCounts={counts}
                filters={filters}
                dispatch={dispatch}
            />
        </section>
    );
}

function LanguageBranchSection({
    langKey,
    branches,
    langCounts,
    filters,
    dispatch,
}) {
    const branch =
        filters[langKey].active;

    const list =
        langCounts?.[branch] || [];

    const triMap =
        filters[langKey].tri[
        branch
        ] || new Map();

    const allNames = list.map(
        (item) => item.name
    );

    return (
        <div className="space-y-3">
            <Segmented
                value={branch}
                onChange={(value) => {
                    dispatch({
                        type:
                            "SET_LANG_ACTIVE",

                        langKey,
                        value,
                    });
                }}
                options={branches}
            />

            <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => {
                            dispatch({
                                type:
                                    "SET_LANG_PRESET",

                                langKey,
                                branch,

                                mode: "all",
                                names:
                                    allNames,
                            });
                        }}
                        className={[
                            "px-3 py-2 rounded-xl border transition",

                            filters[
                                langKey
                            ].preset[
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
                            dispatch({
                                type:
                                    "SET_LANG_PRESET",

                                langKey,
                                branch,

                                mode: "none",
                                names:
                                    allNames,
                            });
                        }}
                        className={[
                            "px-3 py-2 rounded-xl border transition",

                            filters[
                                langKey
                            ].preset[
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
                        const tri =
                            triMap.get(
                                item.name
                            ) ||
                            "show";

                        return (
                            <Pill
                                key={
                                    item.name
                                }
                                active={
                                    tri !==
                                    "hide"
                                }
                                tri={tri}

                                onClick={() => {
                                    dispatch({
                                        type:
                                            "SET_LANG_TRI",

                                        langKey,
                                        branch,

                                        name:
                                            item.name,

                                        value:
                                            tri ===
                                                "hide"
                                                ? "show"
                                                : "hide",

                                        names:
                                            allNames,
                                    });
                                }}

                                onDoubleClick={() => {
                                    dispatch({
                                        type:
                                            "SET_LANG_TRI",

                                        langKey,
                                        branch,

                                        name:
                                            item.name,

                                        value:
                                            "force",

                                        names:
                                            allNames,
                                    });
                                }}
                            >
                                {item.name} (
                                {item.current}/
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
    dispatch,
}) {
    return (
        <section className="space-y-3">
            <SectionHeader
                title="主視覺圖"
                onClear={() => {
                    dispatch({
                        type: "RESET_IMAGE",
                    });
                }}
            />

            <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                <input
                    type="checkbox"
                    checked={
                        filters.hideNoMainImage
                    }
                    onChange={(event) => {
                        dispatch({
                            type: "SET_HIDE_NO_MAIN_IMAGE",

                            value:
                                event.target.checked,
                        });
                    }}
                />

                隱藏不含主視覺圖的作品
            </label>
        </section>
    );
}