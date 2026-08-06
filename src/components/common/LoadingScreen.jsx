// src/components/common/LoadingScreen.jsx

export default function LoadingScreen({
    message = "資料載入中...",
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6">
            <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-4" />

            <p className="text-white text-lg">
                {message}
            </p>
        </div>
    );
}