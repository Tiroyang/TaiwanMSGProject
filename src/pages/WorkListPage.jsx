// src/pages/WorkListPage.jsx

import FilterModal from "../components/filters/FilterModal";

import WorkListError from "../components/works/WorkListError";
import WorkListFooter from "../components/works/WorkListFooter";
import WorkListHeader from "../components/works/WorkListHeader";
import WorkListToolbar from "../components/works/WorkListToolbar";
import WorkResults from "../components/works/WorkResults";
import WorkTypeTabs from "../components/works/WorkTypeTabs";
    
import {
    useWorkList,
} from "../hooks/useWorkList";

export default function WorkListPage({
    works,
    tagMap,
    error,
    onBack,
    onSelectWork,
    onOpenAbout,
}) {
    const list = useWorkList(works);

    return (
        <div className="min-h-screen bg-slate-950 pb-10">
            <WorkListHeader
                activeTab={
                    list.activeTab
                }
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
                onOpenAbout={
                    onOpenAbout
                }
            />

            <WorkTypeTabs
                value={
                    list.activeTab
                }
                counts={
                    list.tabCounts
                }
                onChange={
                    list.changeTab
                }
            />

            <WorkListError
                message={error}
            />

            <WorkListToolbar
                activeTab={
                    list.activeTab
                }
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
                activeTab={
                    list.activeTab
                }
                tempFilters={
                    list.tempFilters
                }
                dispatch={
                    list.dispatchTempFilters
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
                pricingModelCounts={
                    list.pricingModelCounts
                }
                langCounts={
                    list.langCounts
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
                open={
                    list.filterOpen
                }
                onClose={
                    list.closeFilter
                }
                tagMap={tagMap}
            />
        </div>
    );
}