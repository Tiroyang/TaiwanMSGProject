// src/pages/HomePage.jsx

import { ArrowRight, Layers } from "lucide-react";
import AboutButton from "../components/about/AboutButton";

export default function HomePage({
    error,
    onOpenList,
    onOpenAbout,
}) {
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-900">
            <AboutButton
                variant="home"
                onClick={onOpenAbout}
            />

            {/* 背景圖 */}
            <div
                className="
          absolute inset-0
          bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80')]
          bg-cover bg-center
          opacity-10 blur-sm
          z-0
        "
            />

            {/* 前景內容 */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-8 max-w-lg">
                    <div className="w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-sky-500/50">
                        <Layers
                            size={40}
                            className="text-white"
                        />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                        台灣作品資料庫

                        <span className="block text-2xl font-bold tracking-tight text-slate-300 italic">
                            Taiwan MSG Project
                        </span>

                        <span className="block text-sky-500 text-base tracking-wide font-normal">
                            Movies • Series • Games
                        </span>

                        <span className="block h-1 w-48 bg-sky-500 mx-auto rounded-full mt-2" />
                    </h1>

                    <button
                        type="button"
                        onClick={onOpenList}
                        className="
              group w-full
              py-4 px-8
              bg-sky-600 hover:bg-sky-500
              text-white rounded-xl
              text-xl font-bold
              transition-all
              shadow-lg hover:shadow-sky-500/30
              flex items-center justify-center gap-3
            "
                    >
                        查看列表

                        <ArrowRight
                            size={24}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </button>

                    {error && (
                        <div className="text-xs text-red-300/90 bg-red-900/20 border border-red-500/20 rounded-lg p-3">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}