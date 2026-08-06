// src/components/detail/RelatedWorksSection.jsx

import { Link2 } from "lucide-react";

import DetailSection from "./DetailSection";

function parseRelatedWorks(text) {
    const value = String(text || "");
    const regex = /\(([^,]+),\s*([^)]+)\)/g;
    const result = [];

    let match;

    while ((match = regex.exec(value))) {
        result.push({
            description: match[1].trim(),
            id: match[2].trim(),
        });
    }

    return result;
}

function getWorkTitle(works, id) {
    const work = works.find(
        (item) =>
            String(item.id) === String(id)
    );

    return (
        work?.title_zh ||
        work?.title_original ||
        work?.title_en ||
        String(id)
    );
}

export default function RelatedWorksSection({
    text,
    works,
}) {
    if (!text) {
        return null;
    }

    const items =
        parseRelatedWorks(text);

    return (
        <DetailSection title="相關作品">
            {!items.length ? (
                <p className="break-all text-sm text-sky-400">
                    {text}
                </p>
            ) : (
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className="flex break-words text-sm text-slate-200"
                        >
                            <span className="text-slate-400">
                                {item.description}
                            </span>

                            <a
                                href={`#/work/${encodeURIComponent(
                                    item.id
                                )}`}
                                className="ml-2 flex items-center text-sm text-sky-400 underline underline-offset-4 hover:text-sky-300"
                            >
                                <Link2
                                    size={14}
                                    className="mr-2 shrink-0"
                                />

                                {getWorkTitle(
                                    works,
                                    item.id
                                )}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </DetailSection>
    );
}