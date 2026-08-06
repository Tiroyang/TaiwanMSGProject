// src/components/common/SimpleMarkdown.jsx

export default function SimpleMarkdown({
    text,
    className = "",
}) {
    const parts = String(text || "")
        .split(/(\*\*.*?\*\*)/g);

    return (
        <div
            className={[
                "markdown-body",
                className,
            ].join(" ")}
        >
            {parts.map((part, index) => {
                const isBold =
                    part.startsWith("**") &&
                    part.endsWith("**");

                if (isBold) {
                    return (
                        <strong
                            key={index}
                            className="font-bold text-sky-400"
                        >
                            {part.slice(2, -2)}
                        </strong>
                    );
                }

                return part;
            })}
        </div>
    );
}