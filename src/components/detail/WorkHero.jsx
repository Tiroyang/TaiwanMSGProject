// src/components/detail/WorkHero.jsx

import {
  Clock,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";

import {
  getStatusClass,
  getTypeClass,
} from "../../utils/workStyles";

export default function WorkHero({
  work,
  imageCount,
  onOpenImage,
}) {
  const isMovie =
    work.work_type_key === "movies";

  const isSeries =
    work.work_type_key === "series";

  const isGame =
    work.work_type_key === "games";

  return (
    <>
      <div className="relative h-48 w-full overflow-hidden">
        {work.main_image_url ? (
          <img
            src={work.main_image_url}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-50 blur-sm"
          />
        ) : (
          <div className="h-full w-full bg-slate-800" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative z-10 -mt-20 px-5">
        <div className="flex items-end gap-4">
          <button
            type="button"
            onClick={() => {
              if (work.main_image_url) {
                onOpenImage(0);
              }
            }}
            disabled={!work.main_image_url}
            className={[
              "group relative aspect-[2/3] w-32 flex-shrink-0 overflow-hidden rounded-lg border-2 border-slate-700 bg-slate-800 shadow-2xl",
              work.main_image_url
                ? "cursor-pointer hover:border-sky-500"
                : "cursor-default",
            ].join(" ")}
          >
            {work.main_image_url ? (
              <>
                <img
                  src={work.main_image_url}
                  alt={
                    work.title_zh ||
                    "作品主視覺圖"
                  }
                  className="h-full w-full object-cover"
                />

                <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn
                    size={32}
                    className="text-white"
                  />
                </span>
              </>
            ) : (
              <span className="flex h-full w-full items-center justify-center text-slate-600">
                <ImageIcon size={32} />
              </span>
            )}
          </button>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white">
            {work.title_zh || "未知作品"}
          </h1>

          {isMovie &&
            work.title_original &&
            work.title_original !==
              work.title_zh && (
              <p className="text-sm font-medium text-slate-300">
                原文：{work.title_original}
              </p>
            )}

          {work.title_en && (
            <p className="text-sm font-medium text-slate-400">
              {work.title_en}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`shrink-0 rounded border px-2 py-1 text-xs ${getTypeClass(
                work
              )}`}
            >
              {work.work_type || "未知"}
            </span>

            <span
              className={`rounded border px-2 py-1 text-xs ${getStatusClass(
                work.status
              )}`}
            >
              {work.status || "未知"}
            </span>

            {work.runtime && (
              <span className="flex items-center rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300">
                <Clock
                  size={10}
                  className="mr-1"
                />

                {work.runtime}
                {isGame ? "" : " 分"}
              </span>
            )}

            {isSeries &&
              work.episode_total_count && (
                <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300">
                  共 {work.episode_total_count} 集
                </span>
              )}
          </div>

          {imageCount > 1 && (
            <button
              type="button"
              onClick={() => onOpenImage(1)}
              className="mt-4 flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
            >
              <ImageIcon
                size={16}
                className="mr-2"
              />

              查看 {imageCount} 張圖片
            </button>
          )}
        </div>
      </div>
    </>
  );
}