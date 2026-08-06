const FOOTER_TEXT = "僅收錄台灣製作、台灣取景或／和設定在台灣的影視作品。電影僅包含40分鐘以上長片。遊戲僅包含台灣製作的電子遊戲，且不包括大型電玩。";

export default function WorkListFooter() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-800 bg-slate-900/80 px-4 shadow-md backdrop-blur-md">
            <div className="mx-auto max-w-3xl overflow-hidden">
                <p className="hidden truncate py-1 text-xs text-slate-400 md:block">
                    {FOOTER_TEXT}
                </p>

                <div className="marquee-wrap md:hidden">
                    <div className="marquee-track py-1">
                        <span className="marquee-item text-xs text-slate-400">
                            {FOOTER_TEXT}
                        </span>

                        <span className="marquee-item text-xs text-slate-400">
                            {FOOTER_TEXT}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}