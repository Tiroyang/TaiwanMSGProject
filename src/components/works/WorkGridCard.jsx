// src/components/works/WorkGridCard.jsx

import {
    Calendar,
    Globe,
    Image as ImageIcon,
} from "lucide-react";

import HoverScrollTags from "./HoverScrollTags";

import {
    formatChineseDate,
} from "../../utils/dates";

import {
    formatCountriesSorted,
    splitToZhList,
} from "../../utils/strings";

import {
    getSortedGenreTagsByFrequency,
} from "../../utils/tags";

import {
    getStatusClass,
    getTypeClass,
} from "../../utils/workStyles";

export default function WorkGridCard({
    work,
    active,
    tagMap,
    genreCountMap,
    onMouseEnter,
    onMouseLeave,
    onClick,
}) {
    const genreTags =
        getSortedGenreTagsByFrequency(
            work.genre_tags,
            genreCountMap
        );

    return (
        <article
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg transition-all hover:border-sky-500/50"
        >
            <div className="relative aspect-square w-full overflow-hidden bg-slate-800">
                {work.main_image_url ? (
                    <img
                        src={work.main_image_url}
                        alt={work.title_zh || ""}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-600">
                        <ImageIcon
                            size={32}
                            className="mb-2 opacity-50"
                        />

                        <span className="text-xs">
                            No Image
                        </span>
                    </div>
                )}

                <div className="absolute left-2 top-2">
                    {/*
                        <span
                            className={`rounded border px-2 py-1 text-xs backdrop-blur ${getTypeClass(
                                work
                            )}`}
                        >
                            {work.work_type || "未知"}
                        </span>
                    */}
                </div>

                <div className="absolute right-2 top-2">
                    <span
                        className={`rounded border px-2 py-1 text-sm backdrop-blur ${getStatusClass(
                            work.status
                        )}`}
                    >
                        {work.status || "未知"}
                    </span>
                </div>
            </div>

            <div className="flex flex-grow flex-col p-3">
                <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-white">
                    {work.title_zh || work.title_en || work.original || "未知"}

                    {work.title_original && (
                        work.title_zh
                            ? (work.title_original !== work.title_zh && work.title_original !== work.title_en)
                            : work.title_en
                                ? (work.title_original !== work.title_en)
                                : false
                    ) && (
                            <span className="ml-1 text-sm font-normal text-slate-400">
                                ({work.title_original})
                            </span>
                        )}
                </h3>

                <div className="mt-auto space-y-1">
                    <div className="flex items-center text-sm text-sky-400">
                        <Calendar
                            size={14}
                            className="mr-1"
                        />

                        {formatChineseDate(
                            work.release_date_simp
                        )}
                    </div>

                    <div className="flex items-center text-sm text-slate-400">
                        <Globe
                            size={14}
                            className="mr-1"
                        />

                        <span className="truncate">
                            {splitToZhList(
                                formatCountriesSorted(
                                    work.countries
                                )
                            )}
                        </span>
                    </div>

                    <HoverScrollTags
                        tags={genreTags}
                        active={active}
                        tagMap={tagMap}
                    />
                </div>
            </div>
        </article>
    );
}