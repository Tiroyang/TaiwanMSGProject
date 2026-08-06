// src/pages/WorkListPage.jsx

import { useMemo } from "react";

import WorkDetailHeader from "../components/detail/WorkDetailHeader";
import WorkHero from "../components/detail/WorkHero";
import WorkBasicInfo from "../components/detail/WorkBasicInfo";
import WorkLanguageSection from "../components/detail/WorkLanguageSection";
import WorkDescriptionSection from "../components/detail/WorkDescriptionSection";
import RelatedWorksSection from "../components/detail/RelatedWorksSection";
import RelatedLinksSection from "../components/detail/RelatedLinksSection";
import ImageCarouselModal from "../components/detail/ImageCarouselModal";

import { useImageGallery } from "../hooks/useImageGallery";

import {
    getSortedGenreTagsByFrequency,
} from "../utils/tags";

export default function WorkDetailPage({
    work,
    works,
    tagMap,
    genreCountMap,
    onBack,
}) {
    const gallery =
        useImageGallery(work);

    const genreTags = useMemo(() => {
        if (!work) {
            return [];
        }

        return getSortedGenreTagsByFrequency(
            work.genre_tags,
            genreCountMap
        );
    }, [
        work,
        genreCountMap,
    ]);

    if (!work) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6">
                <p className="mb-4 text-slate-300">
                    找不到這筆作品資料。
                </p>

                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-500"
                >
                    返回列表
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <WorkDetailHeader
                onBack={onBack}
            />

            <WorkHero
                work={work}
                imageCount={gallery.images.length}
                onOpenImage={gallery.open}
            />

            <main className="relative z-10 mt-6 grid grid-cols-1 gap-4 px-5 text-sm">
                <WorkBasicInfo
                    work={work}
                    tagMap={tagMap}
                    genreTags={genreTags}
                />

                <WorkLanguageSection
                    work={work}
                />

                <WorkDescriptionSection
                    description={
                        work.description_zh
                    }
                />

                <RelatedWorksSection
                    text={work.related_work}
                    works={works}
                />

                <RelatedLinksSection
                    text={work.related_links}
                />

                <div className="mt-4 pb-4 text-center text-xs text-slate-600">
                    ID: {work.id} • Last Updated:{" "}
                    {work.last_update}
                </div>
            </main>

            <ImageCarouselModal
                open={gallery.isOpen}
                images={gallery.images}
                currentIndex={
                    gallery.currentIndex
                }
                onNext={gallery.next}
                onPrevious={gallery.previous}
                onClose={gallery.close}
            />
        </div>
    );
}