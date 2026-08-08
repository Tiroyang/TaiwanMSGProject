// src/components/detail/DetailSection.jsx

export default function DetailSection({
    title,
    icon,
    children,
    className = "",
}) {
    return (
        <section
            className={[
                "rounded-xl border border-slate-800 bg-slate-900/50 p-4",
                className,
            ].join(" ")}
        >
            {title && (
                <h3 className="mb-2 flex items-center text-lg font-bold uppercase text-slate-400">
                    {icon}

                    {icon && (
                        <span className="ml-1">
                            {title}
                        </span>
                    )}

                    {!icon && title}
                </h3>
            )}

            {children}
        </section>
    );
}