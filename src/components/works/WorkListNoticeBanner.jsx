// src/components/works/WorkListNoticeBanner.jsx

const TAB_NOTICES = {
    movies:
        "電影資料仍在持續蒐集與補充中…",

    series:
        "影集資料仍在持續蒐集與補充中…",

    games:
        "遊戲資料仍在持續蒐集與補充中…",
};

export default function WorkListNoticeBanner({
    activeTab,
}) {
    const content =
        TAB_NOTICES[activeTab] ??
        TAB_NOTICES.movies;

    return (
        <div className="
            mx-auto max-w-6xl 
            border-b border-slate-800
            bg-slate-950/85 backdrop-blur-md
            flex items-center justify-center
            px-4 py-2.5
        ">
            <p className="
                min-w-0 text-center
                text-xs leading-5
                text-slate-400
                sm:text-sm
            ">
                {content}
            </p>
        </div>
    );
}
