// src/components/works/WorkListItem.jsx

import { Calendar } from "lucide-react";

import SimpleMarkdown from "../common/SimpleMarkdown";

import {
    formatChineseDate,
} from "../../utils/dates";

import {
    formatActorList,
    formatCountriesSorted,
    splitToZhList,
} from "../../utils/strings";

import {
    getStatusClass,
    getTypeClass,
} from "../../utils/workStyles";

export default function WorkListItem({
    work,
    onClick,
}) {
    return (
        <article
            onClick={onClick}   
            className="relative flex cursor-pointer items-stretch gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 transition-all hover:border-sky-500/50"
        >
            <div className="group relative shrink-0">
                {work.main_image_url ? (
                    <>
                        <div className="aspect-[2/3] w-12 overflow-hidden rounded-lg bg-slate-800">
                            <img
                                src={work.main_image_url}
                                alt={work.title_zh || ""}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        </div>

                        <div className="pointer-events-none absolute right-0 top-1/2 z-50 max-h-[60vh] w-[260px] -translate-y-1/2 scale-95 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                            <img
                                src={work.main_image_url}
                                alt={`${work.title_zh} preview`}
                                className="h-auto w-full bg-black object-contain shadow-2xl"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex aspect-[2/3] w-12 items-center justify-center rounded-lg bg-slate-800 text-xs text-slate-500">
                        No Image
                    </div>
                )}
            </div>

            <div className="flex shrink-0 flex-col justify-start gap-2 pt-1">
                <span
                    className={`rounded border px-2 py-1 text-xs backdrop-blur ${getStatusClass(
                        work.status
                    )}`}
                >
                    {work.status || "未知"}
                </span>

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

            <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-white">
                    {work.title_zh || work.title_en || work.original || "標題未知"}
                </h3>

                <p className="truncate text-xs text-slate-400">
                    {work.title_original &&
                        work.title_original !== work.title_zh &&
                        work.title_original !== work.title_en
                        ? `(${work.title_original})`
                        : "\u00a0"}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="inline-flex items-center">
                        <Calendar
                            size={12}
                            className="mr-1"
                        />

                        {formatChineseDate(
                            work.release_date_simp
                        )}
                    </span>

                    {work.countries && (
                        <span className="truncate">
                            國家/地區：
                            {splitToZhList(
                                formatCountriesSorted(
                                    work.countries
                                )
                            )}
                        </span>
                    )}
                </div>
            </div>

            <WorkListMetadata work={work} />

            <div className="hidden min-w-0 w-[30%] items-start md:flex lg:w-[40%]">
                <div className="line-clamp-3 text-sm leading-relaxed text-slate-400">
                    {work.description_zh && (
                        <SimpleMarkdown
                            text={
                                work.description_zh
                            }
                        />
                    )}
                </div>
            </div>
        </article>
    );
}

function WorkListMetadata({ work }) {
    return (
        <div className="hidden w-[220px] shrink-0 flex-col justify-start gap-2 lg:flex">
            {work.work_type_key === "games" ? (
                <MetadataLine
                    label="收費模式"
                    value={work.pricing_model
                        ? splitToZhList(
                            work.pricing_model
                        )
                        : null}
                />
            ) : (
                <MetadataLine
                    label="片長"
                    value={
                        work.runtime
                            ? `${work.runtime} 分鐘`
                            : ""
                    }
                />
            )}

            <MetadataLine
                label={
                    work.director
                        ? "導演"
                        : "開發商"
                }
                value={
                    work.director
                        ? splitToZhList(
                            work.director
                        )
                        : splitToZhList(
                            work.developer
                        )
                }
            />

            <MetadataLine
                label={
                    work.main_cast
                        ? "主演"
                        : "發行商"
                }
                value={
                    work.main_cast
                        ? splitToZhList(
                            formatActorList(
                                work.main_cast
                            )
                        )
                        : splitToZhList(
                            work.publisher
                        )
                }
            />
        </div>
    );
}

function MetadataLine({
    label,
    value,
}) {
    if (!value || value === "無") {
        return (
            <div className="text-xs text-slate-400">
                {"\u00a0"}
            </div>
        );
    }

    return (
        <div className="truncate text-xs leading-snug text-slate-400">
            <span className="text-slate-200">
                {label}
            </span>

            <span className="mx-1">
                {value}
            </span>
        </div>
    );
}