// src/components/works/WorkTypeTabs.jsx

const WORK_TABS = [
    {
        key: "movies",
        label: "電影",
    },
    {
        key: "series",
        label: "影集",
    },
    {
        key: "games",
        label: "遊戲",
    },
];

export default function WorkTypeTabs({
    value,
    counts,
    onChange,
}) {
    return (
        <nav className="sticky top-[57px] z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl">
                {WORK_TABS.map((tab) => {
                    const active =
                        value === tab.key;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => {
                                onChange(tab.key);
                            }}
                            className={[
                                "relative flex-1 px-4 py-3",
                                "text-sm font-semibold",
                                "transition-colors",

                                active
                                    ? "text-sky-300"
                                    : "text-slate-400 hover:text-slate-200",
                            ].join(" ")}
                        >
                            {tab.label}

                            <span className="ml-1 text-xs opacity-70">
                                (
                                {counts?.[
                                    tab.key
                                ] ?? 0}
                                )
                            </span>

                            {active && (
                                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-sky-400" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}