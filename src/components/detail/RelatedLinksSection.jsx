// src/components/detail/RelatedLinksSection.jsx

import { ExternalLink } from "lucide-react";

import DetailSection from "./DetailSection";

function parseRelatedLinks(text) {
    const value = String(text || "");
    const pattern = /\(([^,]+),\s*([^)]+)\)/g;
    const links = [];

    let match;

    while ((match = pattern.exec(value)) !== null) {
        links.push({
            name: match[1].trim(),
            url: match[2].trim(),
        });
    }

    return links;
}

function isSafeExternalUrl(url) {
    try {
        const parsedUrl = new URL(url);

        return (
            parsedUrl.protocol === "http:" ||
            parsedUrl.protocol === "https:"
        );
    } catch {
        return false;
    }
}

export default function RelatedLinksSection({
    text,
}) {
    if (!text) {
        return null;
    }

    const links = parseRelatedLinks(text);

    if (!links.length) {
        return (
            <DetailSection title="相關連結">
                <p className="break-all text-base text-sky-400">
                    {String(text)}
                </p>
            </DetailSection>
        );
    }

    return (
        <DetailSection title="相關連結">
            <div className="space-y-2">
                {links.map((link, index) => {
                    const validUrl = isSafeExternalUrl(
                        link.url
                    );

                    if (!validUrl) {
                        return (
                            <div
                                key={`${link.name}-${index}`}
                                className="flex items-center text-sm text-slate-500"
                                title="連結格式無效"
                            >
                                <ExternalLink
                                    size={16}
                                    className="mr-2 shrink-0"
                                />

                                <span>
                                    {link.name}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <a
                            key={`${link.url}-${index}`}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-base text-sky-400 underline underline-offset-4 transition-colors hover:text-sky-300"
                        >
                            <ExternalLink
                                size={16}
                                className="mr-2 shrink-0"
                            />

                            {link.name}
                        </a>
                    );
                })}
            </div>
        </DetailSection>
    );
}