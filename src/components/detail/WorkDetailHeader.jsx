// src/components/detail/WorkDetailHeader.jsx

import { ArrowLeft } from "lucide-react";

export default function WorkDetailHeader({
  onBack,
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-800 bg-slate-900/90 px-4 py-3 shadow-md backdrop-blur-md">
      <button
        type="button"
        onClick={onBack}
        className="rounded-full p-1 text-white transition-colors hover:bg-slate-800"
        aria-label="返回列表"
      >
        <ArrowLeft />
      </button>

      <h2 className="truncate text-lg font-bold text-white">
        詳細資訊
      </h2>
    </header>
  );
}