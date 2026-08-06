// src/components/detail/WorkLanguageSection.jsx

import {
    parseSupportedLanguages,
} from "../../utils/languages";

import DetailSection from "./DetailSection";
import InfoRow from "./InfoRow";

function formatLanguages(items) {
    return items?.length
        ? items.join("、")
        : "無";
}

export default function WorkLanguageSection({
    work,
}) {
    const isGame =
        work.work_type_key === "games";

    const languages =
        parseSupportedLanguages(
            work.supported_languages
        );

    return (
        <DetailSection title="語言支援">
            <div className="space-y-2 text-sm">
                {isGame ? (
                    <>
                        <InfoRow
                            label="字幕"
                            value={formatLanguages(
                                languages.gm.sub
                            )}
                        />

                        <InfoRow
                            label="語音"
                            value={formatLanguages(
                                languages.gm.voice
                            )}
                        />

                        <InfoRow
                            label="介面"
                            value={formatLanguages(
                                languages.gm.ui
                            )}
                        />
                    </>
                ) : (
                    <>
                        <InfoRow
                            label="原語言"
                            value={formatLanguages(
                                languages.mv.orig
                            )}
                        />

                        <InfoRow
                            label="配音"
                            value={formatLanguages(
                                languages.mv.dub
                            )}
                        />

                        <InfoRow
                            label="字幕"
                            value={formatLanguages(
                                languages.mv.sub
                            )}
                        />
                    </>
                )}
            </div>
        </DetailSection>
    );
}