// src/components/about/AboutButton.jsx

import {
    CircleHelp,
} from "lucide-react";

export default function AboutButton({
    onClick,
    variant = "header",
}) {
    if (variant === "home") {
        return (
            <button
                type="button"
                onClick={onClick}
                className="
                    fixed right-4 top-4 z-40
                    inline-flex h-11 items-center gap-2
                    rounded-xl
                    border border-slate-700
                    bg-slate-900/80
                    px-4
                    text-sm font-semibold text-slate-200
                    shadow-lg backdrop-blur-md
                    transition
                    hover:border-sky-500/40
                    hover:bg-slate-800
                    hover:text-white
                "
                title="關於網站"
            >
                <CircleHelp size={19} />

                <span>
                    關於
                </span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className="
                p-2
                text-slate-400
                transition-colors
                hover:text-white
            "
            title="關於網站"
            aria-label="關於網站"
        >
            <CircleHelp size={18} />
        </button>
    );
}