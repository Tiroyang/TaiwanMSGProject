// src/hooks/useWorkList.js

import {
    useCallback,
    useEffect,
    useMemo,
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
} from "../components/filters/filterState";

export function useWorkList(works) {
    const [displayMode, setDisplayMode] =
        useState("grid");

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

    const [
        dateFormatWarning,
        setDateFormatWarning,
    ] = useState(false);

    const [filters, setFilters] = useState(
        () => createInitialFilters()
    );

    const [
        tempFilters,
        setTempFilters,
    ] = useState(
        () => createInitialFilters()
    );

    useEffect(() => {
        if (!filterOpen) {
            return;
        }

        setTempFilters(
            cloneFilterState(filters)
        );
    }, [filterOpen, filters]);

    const filteredWorks = useMemo(() => {
        return applyAdvancedFilters(
            works,
            filters
        );
    }, [works, filters]);

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
        () => buildGenreCountMap(works),
        [works]
    );

    const statusCountsTotal = useMemo(
        () => buildStatusCountList(works),
        [works]
    );

    const countryCountsTotal = useMemo(
        () =>
            buildCountListFromCommaField(
                works,
                "countries"
            ),
        [works]
    );

    const genreCountsTotal = useMemo(
        () =>
            buildCountListFromCommaField(
                works,
                "genre_tags"
            ),
        [works]
    );

    const langCountsTotal = useMemo(
        () => buildLangCounts(works),
        [works]
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
            setTempFilters(
                createInitialFilters()
            );

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

            setTempFilters(
                cloneFilterState(nextFilters)
            );

            setFilters(
                cloneFilterState(nextFilters)
            );

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
        setTempFilters,

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
        langCounts,
    };
}