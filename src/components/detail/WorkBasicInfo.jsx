// src/components/detail/WorkBasicInfo.jsx

import {
    formatChineseDate,
} from "../../utils/dates";

import {
    formatCountriesSorted,
    parseActorRoles,
    parsePlaceDatePairs,
    splitToZhList,
} from "../../utils/strings";

import InfoRow from "./InfoRow";
import GenreTagText from "./GenreTagText";
import DetailSection from "./DetailSection";

export default function WorkBasicInfo({
    work,
    tagMap,
    genreTags,
}) {
    const isMovie =
        work.work_type_key === "movies";

    const isSeries =
        work.work_type_key === "series";

    const isGame =
        work.work_type_key === "games";

    const releaseRaw =
        work.release_date_detailed ||
        work.release_date;

    const releasePairs =
        parsePlaceDatePairs(releaseRaw);

    const releaseFallback =
        /^\d{4}(-\d{1,2}){0,2}$/.test(
            String(releaseRaw || "").trim()
        )
            ? formatChineseDate(
                String(releaseRaw).trim()
            )
            : releaseRaw;

    return (
        <DetailSection className="space-y-3">
            <InfoRow
                label="製作地區"
                value={
                    work.countries
                        ? splitToZhList(
                            formatCountriesSorted(
                                work.countries
                            )
                        )
                        : ""
                }
            />

            {(isMovie || isSeries) && (
                <InfoRow
                    label="導演"
                    value={
                        work.director
                            ? splitToZhList(work.director)
                            : ""
                    }
                />
            )}

            {isGame && (
                <>
                    <InfoRow
                        label="開發商"
                        value={
                            work.developer
                                ? splitToZhList(
                                    work.developer
                                )
                                : ""
                        }
                    />

                    <InfoRow
                        label="發行商"
                        value={
                            work.publisher
                                ? splitToZhList(
                                    work.publisher
                                )
                                : ""
                        }
                    />

                    <InfoRow
                        label="平台"
                        value={
                            work.platforms
                                ? splitToZhList(
                                    work.platforms
                                )
                                : ""
                        }
                    />

                    <InfoRow
                        label="收費模式"
                        value={
                            work.pricing_model
                                ? splitToZhList(
                                    work.pricing_model
                                )
                                : null
                        }
                    />
                </>
            )}

            {work.main_cast && (
                <InfoRow
                    label="主要演員"
                    value={
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {parseActorRoles(
                                work.main_cast
                            ).map((item, index) => (
                                <span
                                    key={`${item.actor}-${index}`}
                                >
                                    {item.actor}

                                    {item.role && (
                                        <span className="ml-1 text-sm text-slate-400">
                                            飾 {item.role}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    }
                />
            )}

            {work.genre_tags && (
                <InfoRow
                    label="類型"
                    value={
                        <GenreTagText
                            tags={genreTags}
                            tagMap={tagMap}
                        />
                    }
                />
            )}

            <InfoRow
                label={
                    isSeries
                        ? "播映詳情"
                        : "發布詳情"
                }
                value={
                    releasePairs.length ? (
                        <div className="space-y-1">
                            {releasePairs.map(
                                (item, index) => (
                                    <div
                                        key={`${item.place}-${index}`}
                                    >
                                        {item.place}{"　"}
                                        {formatChineseDate(
                                            item.dateRaw
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        releaseFallback
                    )
                }
            />
        </DetailSection>
    );
}