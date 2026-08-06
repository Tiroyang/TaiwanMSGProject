import React from "react";

import {
    getTagTitle,
    getTagView,
} from "../../utils/tags";

export default function GenreTagText({
    tags,
    tagMap,
    lang = "zh",
}) {
    if (!tags?.length) {
        return <span>無</span>;
    }

    return (
        <span>
            {tags.map((tag, index) => {
                const view = getTagView(
                    tag,
                    tagMap,
                    lang
                );

                const title = getTagTitle(
                    tag,
                    tagMap,
                    lang
                );

                return (
                    <React.Fragment
                        key={`${tag}-${index}`}
                    >
                        {index > 0 ? "、" : ""}

                        <span
                            title={title}
                            className={
                                title
                                    ? "cursor-help underline decoration-dotted underline-offset-2"
                                    : ""
                            }
                        >
                            {view.label}
                        </span>
                    </React.Fragment>
                );
            })}
        </span>
    );
}