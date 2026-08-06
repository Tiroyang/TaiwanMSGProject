// src/components/detail/InfoRow.jsx

export default function InfoRow({
    label,
    value,
}) {
    const isEmpty =
        value === null ||
        value === undefined ||
        value === "";

    if (isEmpty) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row sm:gap-2">
            <span className="min-w-[90px] font-bold text-slate-400">
                {label}
            </span>

            <div className="break-words font-medium text-slate-200">
                {value}
            </div>
        </div>
    );
}