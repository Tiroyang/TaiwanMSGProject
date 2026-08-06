// src/pages/WorkListPage.jsx

import FilterModal from "../components/filters/FilterModal";

import WorkListError from "../components/works/WorkListError";
import WorkListFooter from "../components/works/WorkListFooter";
import WorkListHeader from "../components/works/WorkListHeader";
import WorkListToolbar from "../components/works/WorkListToolbar";
import WorkResults from "../components/works/WorkResults";

import {
    useWorkList,
} from "../hooks/useWorkList";

export default function WorkListPage({
    works,
    tagMap,
    error,
    onBack,
    onSelectWork,
}) {
    const list = useWorkList(works);

    return (
        <div className="min-h-screen bg-slate-950 pb-10">
            <WorkListHeader
                resultCount={
                    list.sortedWorks.length
                }
                displayMode={
                    list.displayMode
                }
                onBack={onBack}
                onToggleDisplayMode={
                    list.toggleDisplayMode
                }
            />

            <WorkListError
                message={error}
            />

            <WorkListToolbar
                searchInput={
                    list.searchInput
                }
                onSearchInputChange={
                    list.setSearchInput
                }
                onSearch={
                    list.submitSearch
                }
                sortKey={list.sortKey}
                sortDir={list.sortDir}
                sortMenuOpen={
                    list.sortMenuOpen
                }
                onToggleSortMenu={
                    list.toggleSortMenu
                }
                onCloseSortMenu={
                    list.closeSortMenu
                }
                onSortKeyChange={
                    list.setSortKey
                }
                onSortDirChange={
                    list.setSortDir
                }
                onOpenFilter={
                    list.openFilter
                }
            />

            <WorkResults
                works={list.sortedWorks}
                displayMode={
                    list.displayMode
                }
                hoveredWorkId={
                    list.hoveredWorkId
                }
                tagMap={tagMap}
                genreCountMap={
                    list.genreCountMap
                }
                onHoveredWorkChange={
                    list.setHoveredWorkId
                }
                onSelectWork={
                    onSelectWork
                }
            />

            <WorkListFooter />

            <FilterModal
                open={list.filterOpen}
                onClose={
                    list.closeFilter
                }
                statusCounts={
                    list.statusCounts
                }
                countryCounts={
                    list.countryCounts
                }
                genreCounts={
                    list.genreCounts
                }
                langCounts={
                    list.langCounts
                }
                tempFilters={
                    list.tempFilters
                }
                setTempFilters={
                    list.setTempFilters
                }
                dateFormatWarning={
                    list.dateFormatWarning
                }
                onResetAll={
                    list.resetAllFilters
                }
                onApply={
                    list.applyFilters
                }
                onConfirm={
                    list.confirmFilters
                }
                tagMap={tagMap}
            />
        </div>
    );
}