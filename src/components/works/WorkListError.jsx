// src/components/works/WorkListError.jsx

export default function WorkListError({
    message,
}) {
    if (!message) {
        return null;
    }

    return (
        <div className="mx-auto max-w-4xl px-4 pt-4">
            <div className="rounded-lg border border-red-500/20 bg-red-900/20 p-3 text-xs text-red-300/90">
                {message}
            </div>
        </div>
    );
}