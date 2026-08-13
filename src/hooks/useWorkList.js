// src/hooks/useWorkList.js

import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from "react";

import {
    validateAndNormalizeDateRange,
} from "../utils/dates";

import {
    buildLangCounts,
} from "../utils/languages";

import {
    sortWorks,
} from "../utils/sorting";

import {
    applySearchFilter,
} from "../utils/search";

import {
    applyAdvancedFilters,
} from "../utils/filters";

import {
    buildCountListFromCommaField,
    buildGenreCountMap,
    buildStatusCountList,
    mergeCounts,
    mergeLangCounts,
} from "../utils/counts";

import {
    cloneFilterState,
    createInitialFilters,
    filterReducer,
} from "../components/filters/filterState";

const LIST_TAB_STORAGE_KEY =
    "work-list-active-tab";

const VALID_TABS = new Set([
    "movies",
    "series",
    "games",
]);

const LIST_DISPLAY_STORAGE_KEY =
    "work-list-display-mode";

const VALID_DISPLAY_MODES =
    new Set([
        "grid",
        "list",
    ]);

function isSortKeyAvailableForTab(
    sortKey,
    tab
) {
    if (
        sortKey ===
        "episode_total_count"
    ) {
        return tab === "series";
    }

    if (sortKey === "runtime") {
        return (
            tab === "movies" ||
            tab === "series"
        );
    }

    return true;
}

function getInitialTab() {
    const savedTab =
        sessionStorage.getItem(
            LIST_TAB_STORAGE_KEY
        );

    if (
        savedTab &&
        VALID_TABS.has(savedTab)
    ) {
        return savedTab;
    }

    return "movies";
}

function getInitialDisplayMode() {
    const saved =
        sessionStorage.getItem(
            LIST_DISPLAY_STORAGE_KEY
        );

    if (
        saved &&
        VALID_DISPLAY_MODES.has(saved)
    ) {
        return saved;
    }

    return "grid";
}

export function useWorkList(works) {
    const [activeTab, setActiveTab] =
        useState(getInitialTab());

    useEffect(() => {
        sessionStorage.setItem(
            LIST_TAB_STORAGE_KEY,
            activeTab
        );
    }, [activeTab]);

    const tabCounts = useMemo(() => {
        const counts = {
            movies: 0,
            series: 0,
            games: 0,
        };

        for (const work of works || []) {
            const key =
                work?.work_type_key;

            if (
                Object.prototype.hasOwnProperty.call(
                    counts,
                    key
                )
            ) {
                counts[key] += 1;
            }
        }

        return counts;
    }, [works]);

    const tabWorks = useMemo(() => {
        return (works || []).filter(
            (work) =>
                work?.work_type_key ===
                activeTab
        );
    }, [
        works,
        activeTab,
    ]);

    const [displayMode, setDisplayMode] =
        useState(getInitialDisplayMode());

    useEffect(() => {
        sessionStorage.setItem(
            LIST_DISPLAY_STORAGE_KEY,
            displayMode
        );
    }, [displayMode]);

    const [hoveredWorkId, setHoveredWorkId] =
        useState(null);

    const [searchInput, setSearchInput] =
        useState("");

    const [appliedSearch, setAppliedSearch] =
        useState("");

    const [sortKey, setSortKey] = useState(
        "release_date_simp"
    );

    const [sortDir, setSortDir] =
        useState("desc");

    const [sortMenuOpen, setSortMenuOpen] =
        useState(false);

    const [filterOpen, setFilterOpen] =
        useState(false);

    const changeTab =
        useCallback(
            (nextTab) => {
                if (
                    !VALID_TABS.has(nextTab)
                ) {
                    return;
                }

                if (
                    nextTab === activeTab
                ) {
                    return;
                }

                sessionStorage.setItem(
                    LIST_TAB_STORAGE_KEY,
                    nextTab
                );

                setActiveTab(nextTab);

                setSortMenuOpen(false);
                setFilterOpen(false);
                setHoveredWorkId(null);

                if (
                    !isSortKeyAvailableForTab(
                        sortKey,
                        nextTab
                    )
                ) {
                    setSortKey(
                        "release_date_simp"
                    );

                    setSortDir("desc");
                }
            },
            [
                activeTab,
                sortKey,
            ]
        );

    const [
        dateFormatWarning,
        setDateFormatWarning,
    ] = useState(false);

    const [
        filters,
        dispatchFilters,
    ] = useReducer(
        filterReducer,
        undefined,
        createInitialFilters
    );

    const [
        tempFilters,
        dispatchTempFilters,
    ] = useReducer(
        filterReducer,
        undefined,
        createInitialFilters
    );

    useEffect(() => {
        if (!filterOpen) {
            return;
        }

        dispatchTempFilters({
            type: "REPLACE",
            value: filters,
        });
    }, [
        filterOpen,
        filters,
    ]);

    const filteredWorks = useMemo(() => {
        return applyAdvancedFilters(
            tabWorks,
            filters
        );
    }, [
        tabWorks,
        filters,
    ]);

    const searchedWorks = useMemo(() => {
        return applySearchFilter(
            filteredWorks,
            appliedSearch
        );
    }, [
        filteredWorks,
        appliedSearch,
    ]);

    const sortedWorks = useMemo(() => {
        return sortWorks(
            searchedWorks,
            sortKey,
            sortDir
        );
    }, [
        searchedWorks,
        sortKey,
        sortDir,
    ]);

    const genreCountMap = useMemo(
        () => buildGenreCountMap(tabWorks),
        [tabWorks]
    );

    const statusCountsTotal = useMemo(
        () => buildStatusCountList(tabWorks),
        [tabWorks]
    );

    const countryCountsTotal = useMemo(
        () =>
            buildCountListFromCommaField(
                tabWorks,
                "countries"
            ),
        [tabWorks]
    );

    const genreCountsTotal = useMemo(
        () =>
            buildCountListFromCommaField(
                tabWorks,
                "genre_tags"
            ),
        [tabWorks]
    );

    const pricingModelCountsTotal = useMemo(
        () =>
            buildCountListFromCommaField(
                tabWorks,
                "pricing_model"
            ),
        [tabWorks]
    );

    const langCountsTotal = useMemo(
        () => buildLangCounts(tabWorks),
        [tabWorks]
    );

    const statusCountsCurrent = useMemo(
        () =>
            buildStatusCountList(
                filteredWorks
            ),
        [filteredWorks]
    );

    const countryCountsCurrent = useMemo(
        () =>
            buildCountListFromCommaField(
                filteredWorks,
                "countries"
            ),
        [filteredWorks]
    );

    const genreCountsCurrent = useMemo(
        () =>
            buildCountListFromCommaField(
                filteredWorks,
                "genre_tags"
            ),
        [filteredWorks]
    );

    const pricingModelCountsCurrent = useMemo(
        () =>
            buildCountListFromCommaField(
                filteredWorks,
                "pricing_model"
            ),
        [filteredWorks]
    );

    const langCountsCurrent = useMemo(
        () =>
            buildLangCounts(
                filteredWorks
            ),
        [filteredWorks]
    );

    const statusCounts = useMemo(
        () =>
            mergeCounts(
                statusCountsTotal,
                statusCountsCurrent
            ),
        [
            statusCountsTotal,
            statusCountsCurrent,
        ]
    );

    const countryCounts = useMemo(
        () =>
            mergeCounts(
                countryCountsTotal,
                countryCountsCurrent
            ),
        [
            countryCountsTotal,
            countryCountsCurrent,
        ]
    );

    const genreCounts = useMemo(
        () =>
            mergeCounts(
                genreCountsTotal,
                genreCountsCurrent
            ),
        [
            genreCountsTotal,
            genreCountsCurrent,
        ]
    );

    const pricingModelCounts = useMemo(
        () =>
            mergeCounts(
                pricingModelCountsTotal,
                pricingModelCountsCurrent
            ),
        [
            pricingModelCountsTotal,
            pricingModelCountsCurrent,
        ]
    );

    const langCounts = useMemo(
        () =>
            mergeLangCounts(
                langCountsTotal,
                langCountsCurrent
            ),
        [
            langCountsTotal,
            langCountsCurrent,
        ]
    );

    const submitSearch = useCallback(() => {
        setAppliedSearch(searchInput);
    }, [searchInput]);

    const resetAllFilters =
        useCallback(() => {
            dispatchTempFilters({
                type: "RESET",
            });

            setDateFormatWarning(false);
        }, []);

    const applyTempFilters = useCallback(
        (shouldClose) => {
            const result =
                validateAndNormalizeDateRange(
                    tempFilters.dateRange
                );

            if (!result.ok) {
                setDateFormatWarning(true);
                return false;
            }

            setDateFormatWarning(false);

            const nextFilters =
                cloneFilterState(
                    tempFilters
                );

            nextFilters.dateRange = {
                ...nextFilters.dateRange,
                start: result.start,
                end: result.end,
            };

            dispatchTempFilters({
                type: "REPLACE",
                value: nextFilters,
            });

            dispatchFilters({
                type: "REPLACE",
                value: nextFilters,
            });

            if (shouldClose) {
                setFilterOpen(false);
            }

            return true;
        },
        [tempFilters]
    );

    const applyFilters =
        useCallback(() => {
            return applyTempFilters(false);
        }, [applyTempFilters]);

    const confirmFilters =
        useCallback(() => {
            return applyTempFilters(true);
        }, [applyTempFilters]);

    const toggleDisplayMode =
        useCallback(() => {
            setDisplayMode((current) =>
                current === "grid"
                    ? "list"
                    : "grid"
            );
        }, []);

    const openFilter =
        useCallback(() => {
            setFilterOpen(true);
        }, []);

    const closeFilter =
        useCallback(() => {
            setFilterOpen(false);
        }, []);

    const closeSortMenu =
        useCallback(() => {
            setSortMenuOpen(false);
        }, []);

    const toggleSortMenu =
        useCallback(() => {
            setSortMenuOpen(
                (current) => !current
            );
        }, []);

    return {
        activeTab,
        setActiveTab,
        tabCounts,
        tabWorks,
        changeTab,

        displayMode,
        toggleDisplayMode,

        hoveredWorkId,
        setHoveredWorkId,

        searchInput,
        setSearchInput,
        appliedSearch,
        submitSearch,

        sortKey,
        setSortKey,
        sortDir,
        setSortDir,
        sortMenuOpen,
        toggleSortMenu,
        closeSortMenu,

        filterOpen,
        openFilter,
        closeFilter,

        filters,
        tempFilters,
        dispatchTempFilters,

        dateFormatWarning,
        resetAllFilters,
        applyFilters,
        confirmFilters,

        filteredWorks,
        searchedWorks,
        sortedWorks,

        genreCountMap,  

        statusCounts,
        countryCounts,
        genreCounts,
        pricingModelCounts,
        langCounts,
    };
}