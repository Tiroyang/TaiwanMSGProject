import React, { useCallback, useEffect, useMemo, useState,  useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  ArrowLeft,
  ZoomIn,
  Image as ImageIcon,
  Home,
  Calendar,
  Globe,
  Clock,
  FileText,
  List,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown
} from "lucide-react";

// Script API（原檔用 fetch 這個）
// :contentReference[oaicite:3]{index=3}
const API_URL =
  "https://script.google.com/macros/s/AKfycbywNLUJkvE2T-mbLU8WvCdhuL_OoI5ittcy7kKmv9sx4WDcSblOyQszIr4hd3bNgyqbrA/exec";

// --- Hash 路由（原檔 getHashPath）---
// :contentReference[oaicite:4]{index=4}
function getHashPath() {
  const hash = window.location.hash || "";
  if (hash.startsWith("#/work/")) {
    const workId = hash.substring("#/work/".length);
    return { view: "detail", workId };
  }
  if (hash === "#/list") return { view: "list", workId: null };
  return { view: "home", workId: null };
}

// --- 日期顯示（原檔 formatChineseDate）---
// :contentReference[oaicite:5]{index=5}
function formatChineseDate(dateString) {
  if (!dateString) return "未定";
  const parts = String(dateString).split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${y}年${parseInt(m)}月${parseInt(d)}日`;
  }
  if (parts.length === 2) {
    const [y, m] = parts;
    return `${y}年${parseInt(m)}月`;
  }
  if (parts.length === 1) return `${parts[0]}年`;
  return String(dateString);
}

// --- 簡易 Markdown（原檔 SimpleMarkdown）---
// :contentReference[oaicite:6]{index=6}
function SimpleMarkdown({ text }) {
  if (!text) return <span className="text-gray-500 italic">無描述</span>;
  const boldParsed = String(text)
    .split(/(\*\*.*?\*\*)/g)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-sky-400 font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  return <div className="markdown-body text-gray-300 text-sm">{boldParsed}</div>;
}

function SimpleMarkdownList({ text }) {
  const boldParsed = String(text)
    .split(/(\*\*.*?\*\*)/g)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-sky-400 font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  return <div className="markdown-body">{boldParsed}</div>;
}

// --- Modal：圖片輪播（原檔 ImageCarouselModal）---
// :contentReference[oaicite:7]{index=7}
function ImageCarouselModal({ images, currentIndex, onNext, onPrev, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, onClose]);

  if (!images || images.length === 0) return null;
  const currentImageUrl = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        title="關閉 (Esc)"
      >
        <X size={24} />
      </button>

      <div
        className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImageUrl}
          alt={`圖片 ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://placehold.co/600x400/374151/ffffff?text=Image+Load+Error";
            e.currentTarget.className += " border border-red-500";
          }}
        />

        {hasMultipleImages && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors hidden md:block"
              title="上一張 (←)"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors hidden md:block"
              title="下一張 (→)"
            >
              <ChevronRight size={32} />
            </button>
            <div className="absolute bottom-4 bg-black/50 px-4 py-2 rounded text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="text-slate-500 min-w-[90px]">{label}</span>
      <span className="text-slate-200 font-medium break-words">{value}</span>
    </div>
  );
}

// (名稱, URL) 解析（原檔 LinkParser）
// :contentReference[oaicite:8]{index=8}
function LinkParser({ linksString }) {
  if (!linksString) return null;
  const regex = /\(([^,]+),\s*([^)]+)\)/g;
  const links = [];
  let match;
  while ((match = regex.exec(String(linksString))) !== null) {
    links.push({ name: match[1].trim(), url: match[2].trim() });
  }
  if (!links.length) return (
    <p className="text-sky-400 break-all text-sm">{String(linksString)}</p>
  );

  return (
    <div className="space-y-2">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sky-400 hover:text-sky-300 transition-colors text-sm underline underline-offset-4"
        >
          <ExternalLink size={14} className="mr-2 flex-shrink-0" />
          {link.name}
        </a>
      ))}
    </div>
  );
}

// "aa, bb, cc" → "aa、bb、cc"（你原檔 SplitElement）
// :contentReference[oaicite:9]{index=9}
function splitToZhList(splitString) {
  if (!splitString) return "無";
  const parts = String(splitString)
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return parts.length ? parts.join("、") : "無";
}

const TYPE_MAP = {
  movies: { key: "movies", label: "電影" },
  series: { key: "series", label: "影集" },
  games: { key: "games", label: "遊戲" },
};

// 標籤顏色
const getStatusClass = (status) => {
  const s = String(status || "");
  if (s.includes("已上映") || s.includes("發行")) return "status-active";
  if (s.includes("正在")) return "status-now";
  if (s.includes("開發") || s.includes("拍攝") ||  s.includes("殺青")) return "status-dev";
  return "status-other";
};

const getTypeClass = (w) => {
  const k = w?.work_type_key;
  if (k === "movies") return "type-movie";
  if (k === "series") return "type-series";
  if (k === "games") return "type-game";

  const id = String(w?.id || "");
  if (id.startsWith("movie")) return "type-movie";
  if (id.startsWith("series")) return "type-series";
  if (id.startsWith("game")) return "type-game";
  return "type-game";
};

function normalizeWorks(apiJson) {
  const out = [];
  const pushList = (listKey) => {
    const list = apiJson?.[listKey] ?? [];
    const typeLabel = TYPE_MAP[listKey]?.label || "未知";
    for (const item of list) {
      if (!item?.id) continue;
      out.push({
        ...item,
        work_type: typeLabel,
        work_type_key: listKey,
        title_original: item.title_original ?? "",
        runtime: item.runtime ?? "",
      });
    }
  };
  pushList("movies");
  pushList("series");
  pushList("games");
  return out;
}

// 抓字串中的「第一段數字」當作內部編碼
function getEmbeddedNumber(str) {
  const m = String(str || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

function compareByEmbeddedNumberThenText(a, b) {
  const A = String(a || "").trim();
  const B = String(b || "").trim();

  const na = getEmbeddedNumber(A);
  const nb = getEmbeddedNumber(B);

  // 兩者都有數字：比數字
  if (na !== null && nb !== null) {
    if (na !== nb) return na - nb;
    // 數字相同再比文字（加 numeric 讓 "2" < "10"）
    return A.localeCompare(B, "zh-Hant", { numeric: true, sensitivity: "base" });
  }

  // 只有一個有數字：有數字者優先
  if (na !== null && nb === null) return -1;
  if (na === null && nb !== null) return 1;

  // 都沒數字：比文字
  return A.localeCompare(B, "zh-Hant", { numeric: true, sensitivity: "base" });
}

// 解析逗號清單
function parseCommaList(str) {
  return String(str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// 國家排序（台灣優先）
function countryRank(name) {
  const s = String(name || "").trim();
  const norm = s.replace("臺", "台");

  if (norm === "台灣") return 0;
  if (norm.includes("日治台灣")) return 1;
  return 999;
}

function formatCountriesSorted(countriesStr) {
  const arr = parseCommaList(countriesStr);
  if (!arr.length) return "";

  arr.sort((a, b) => {
    const ra = countryRank(a);
    const rb = countryRank(b);
    if (ra !== rb) return ra - rb;
    return compareByEmbeddedNumberThenText(a, b);
  });

  return arr.join(", ");
}

// 解析支援語言欄位
// 回傳：{ mv: { orig:[], dub:[], sub:[] }, gm: { sub:[], voice:[], ui:[] } }
function parseSupportedLanguages(supported) {
  const out = {
    mv: { orig: [], dub: [], sub: [] },
    gm: { sub: [], voice: [], ui: [] },
  };

  const s = String(supported || "").trim();
  if (!s) return out;

  // 抓 (X, Y) 的配對
  const regex = /\(([^,]+),\s*([^)]+)\)/g;
  let m;
  while ((m = regex.exec(s)) !== null) {
    const rawKey = String(m[1] || "").trim(); // 原/配/字/語/介
    const rawVal = String(m[2] || "").trim();

    // 值用 "/" 分隔
    const list = rawVal
      .split("/")
      .map((x) => x.replace(/\s*\(.*/g, "").trim())
      .filter((x) => x.length > 0);

    const key = rawKey.replace("　", ""); // 防全形空白

    const pushList = (bucket, items, emptyAsNone) => {
      if (items.length > 0) bucket.push(...items);
      else if (emptyAsNone) bucket.push("無");
    };

    if (key === "原") {
      const filtered = list.filter((x) => x !== "未知");
      pushList(out.mv.orig, filtered, true);
    } else if (key === "配") {
      const filtered = list.filter((x) => x !== "未知");
      pushList(out.mv.dub, filtered, true);
    } else if (key === "字") {
      // 這個 (字, ) 可能是影視也可能是遊戲，你的資料格式兩者都會出現
      // 我們同時記到 mv.sub 與 gm.sub，後續顯示時依 mode 取對的
      const filtered = list.filter((x) => x !== "未知");
      pushList(out.mv.sub, filtered, true);
      pushList(out.gm.sub, filtered, true);
    } else if (key === "語") {
      const filtered = list.filter((x) => x !== "未知");
      pushList(out.gm.voice, filtered, true);
    } else if (key === "介") {
      const filtered = list.filter((x) => x !== "未知");
      pushList(out.gm.ui, filtered, true);
    }
  }

  return out;
}

function buildCountListFromArray(arr) {
  const map = new Map();
  for (const x of arr) map.set(x, (map.get(x) || 0) + 1);
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count - a.count) || compareByEmbeddedNumberThenText(a.name, b.name));
}

// 類型排序
function getSortedGenreTagsByFrequency(genreTagsStr, genreCountMap) {
  const tags = String(genreTagsStr || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  tags.sort((a, b) => {
    const ca = genreCountMap.get(a) || 0;
    const cb = genreCountMap.get(b) || 0;

    if (ca !== cb) return cb - ca;

    return compareByEmbeddedNumberThenText(a, b);
  });

  return tags;
}

// 簡易主要演員格式化
function formatActorList(str) {
  if (!str) return "";

  return String(str)
    .split(",")
    .map((s) => s.replace(/\(.*?\)/g, "").trim()) // 移除 (角色名)
    .filter(Boolean)
    .join(",");
}

// 把 "movie-021" / "series-001" / "game-010" 拆成 {prefix, num}
function parseIdParts(id) {
  const s = String(id || "");
  const prefix = (s.match(/^[a-zA-Z]+/) || [""])[0].toLowerCase();
  const num = (() => {
    const m = s.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  })();
  return { prefix, num };
}

function compareId(aId, bId) {
  const A = parseIdParts(aId);
  const B = parseIdParts(bId);
  // 先依首字母/前綴排序（企劃書例：game > movie > series，會隨遞增遞減反轉）:contentReference[oaicite:1]{index=1}
  const p = A.prefix.localeCompare(B.prefix, "en", { sensitivity: "base" });
  if (p !== 0) return p;
  // 再依數字
  if (A.num !== null && B.num !== null) return A.num - B.num;
  if (A.num !== null && B.num === null) return -1;
  if (A.num === null && B.num !== null) return 1;
  return String(aId || "").localeCompare(String(bId || ""), "en", { numeric: true });
}

// YYYY / YYYY-MM / YYYY-MM-DD -> 數字（補成「最早」：YYYY0101、YYYYMM01）:contentReference[oaicite:2]{index=2}
function parseLooseDateToNumber(s) {
  const str = String(s || "").trim();
  if (!str) return null;

  // 允許 YYYY 或 YYYY-MM 或 YYYY-MM-DD
  const m = str.match(/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/);
  if (!m) return null;

  const y = parseInt(m[1], 10);
  const mo = m[2] ? parseInt(m[2], 10) : 0;
  const d = m[3] ? parseInt(m[3], 10) : 0;

  // 轉成 yyyymmdd 數字比較
  return y * 10000 + mo * 100 + d;
}

// 片長可能是 "15~30" / "102" / "" -> 取最大數字:contentReference[oaicite:3]{index=3}
function parseRuntimeMax(runtime) {
  const str = String(runtime || "").trim();
  if (!str) return null;
  const nums = str.match(/\d+/g);
  if (!nums || !nums.length) return null;
  return Math.max(...nums.map((n) => parseInt(n, 10)));
}

// 名稱：用你既有 compareByEmbeddedNumberThenText（內碼）:contentReference[oaicite:4]{index=4}
function getSortName(work) {
  // 這裡先用中文；之後你做中英切換時，再改成依語言選 title_en/title_original/title_zh
  return String(work?.title_zh || "").trim();
}

function formatGenreTagsSorted(genreTagsStr) {
  const tags = getSortedGenreTagsByFrequency(genreTagsStr);
  return tags.length ? tags.join(", ") : "";
}

// 標籤自動滾動
function HoverScrollTags({ tags, active }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const rafRef = useRef(0);
  const [overflowX, setOverflowX] = useState(0);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const measure = () => {
      const dist = Math.max(0, track.scrollWidth - wrap.clientWidth);
      setOverflowX(dist);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tags]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const stop = () => {
      animRef.current?.cancel?.();
      animRef.current = null;
      track.style.transform = "translateX(0px)";
    };

    if (!active || overflowX <= 0) {
      stop();
      return;
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      stop();

      const msPerPx = 18;
      const travel = overflowX;
      const travelMs = Math.max(800, travel * msPerPx);
      const pauseMs = 900;
      const total = travelMs + pauseMs + travelMs + pauseMs;

      animRef.current = track.animate(
        [
          { transform: "translateX(0px)", offset: 0 },
          { transform: "translateX(0px)", offset: pauseMs / total },
          { transform: `translateX(-${travel}px)`, offset: (pauseMs + travelMs) / total },
          { transform: `translateX(-${travel}px)`, offset: (pauseMs + travelMs + pauseMs) / total },
          { transform: "translateX(0px)", offset: 1 },
        ],
        { duration: total, iterations: Infinity, easing: "linear" }
      );
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      animRef.current?.cancel?.();
      animRef.current = null;
    };
  }, [active, overflowX]);

  return (
    <div ref={wrapRef} className="flex gap-1 mt-2 overflow-hidden whitespace-nowrap">
      <div ref={trackRef} className="inline-flex gap-1 will-change-transform">
        {tags.map((tag, i) => (
          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// 搜尋系統
// "_" => " "
const normalizeSearchText = (s) => String(s ?? "").replaceAll("_", " ").trim();

// 把 work 某個欄位取成「可搜尋字串」
const getFieldText = (work, field) => {
  const v = work?.[field];
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" ");
  return String(v);
};

// 全域可搜尋字串
const getGlobalSearchText = (work) => {
  // 建議涵蓋：id / 標題 / 國家 / 類型 / 狀態 / 人名 / 描述 / tags / 語言 等
  const fields = [
    "id",
    "status",
    "work_type",
    "title_zh",
    "title_original",
    "title_en",
    "release_date_simp",
    "release_date",
    "countries",
    "director",
    "main_cast",
    "developer",
    "publisher",
    "platforms",
    "runtime",
    "episode_total_count",
    "genre_tags",
    "supported_languages",
    "description_zh",
    "description_en",
  ];

  return fields.map((f) => getFieldText(work, f)).join(" ");
};

// 將一段query解析成 tokens
const parseTokenBlock = (raw) => {
  const s = normalizeSearchText(raw);
  if (!s) return { plus: [], minus: [], plain: [] };

  // 這裡用空白分割
  const parts = s.split(/\s+/).filter(Boolean);

  const plus = [];
  const minus = [];
  const plain = [];

  for (const p of parts) {
    if (p.startsWith("+") && p.length > 1) plus.push(p.slice(1));
    else if (p.startsWith("-") && p.length > 1) minus.push(p.slice(1));
    else plain.push(p);
  }

  return { plus, minus, plain };
};

// 若含 "|" 或 "field:" => advanced
// advanced: 用 "|" 切段，每段可選 field:xxx
const parseSearchQuery = (input) => {
  const q = normalizeSearchText(input);
  if (!q) return { mode: "none", blocks: [] };

  const isAdvanced = q.includes("|") || /field\s*:/i.test(q);

  if (!isAdvanced) {
    const t = parseTokenBlock(q);
    return { mode: "basic", blocks: [{ field: null, ...t }] };
  }

  const segments = q.split("|").map((x) => x.trim()).filter(Boolean);

  const blocks = segments.map((seg) => {
    // field:xxx 開頭
    const m = seg.match(/^field\s*:\s*([a-zA-Z0-9_]+)\s*(.*)$/i);
    if (m) {
      const field = m[1];
      const rest = m[2] ?? "";
      const t = parseTokenBlock(rest);
      return { field, ...t };
    }
    const t = parseTokenBlock(seg);
    return { field: null, ...t };
  });

  return { mode: "advanced", blocks };
};

// 判斷：某個文字是否命中 token（不分大小寫）
const textHas = (haystack, needle) => {
  const h = String(haystack ?? "").toLowerCase();
  const n = String(needle ?? "").toLowerCase();
  return n ? h.includes(n) : false;
};

// 套用一個 block（field=null => global）
const matchBlock = (work, block) => {
  const sourceText = block.field
    ? getFieldText(work, block.field)
    : getGlobalSearchText(work);

  // 1) 先處理 minus：只要中任何一個就淘汰
  if (block.minus.some((kw) => textHas(sourceText, kw))) return false;

  // 2) 若此 block 有 plus：必須「全部 plus 都命中」
  if (block.plus.length > 0) {
    return block.plus.every((kw) => textHas(sourceText, kw));
  }

  // 3) 沒 plus：則用 plain（全部都命中）作為一般過濾
  if (block.plain.length > 0) {
    return block.plain.every((kw) => textHas(sourceText, kw));
  }

  // 4) 只有 minus（且已通過）=> 放行
  return true;
};

// 整體 match：
// - 先跑 blocks AND
// - 再處理「全局 plus 特例」：只要整個 query 任一 block 有 plus，
//   則作品必須至少命中「某個 block 的 plus 條件」(且仍需通過 blocks AND)
const applySearchFilter = (works, input) => {
  const parsed = parseSearchQuery(input);
  if (parsed.mode === "none") return works;

  const blocks = parsed.blocks;

  const anyPlus = blocks.some((b) => b.plus && b.plus.length > 0);

  return works.filter((work) => {
    // blocks AND
    const passAllBlocks = blocks.every((b) => matchBlock(work, b));
    if (!passAllBlocks) return false;

    if (!anyPlus) return true;

    // 至少命中某一個「含 plus 的 block」
    const passAnyPlusBlock = blocks
      .filter((b) => b.plus && b.plus.length > 0)
      .some((b) => {
        const sourceText = b.field ? getFieldText(work, b.field) : getGlobalSearchText(work);
        return b.plus.every((kw) => textHas(sourceText, kw));
      });

    return passAnyPlusBlock;
  });
};

// 三狀態全選全不選
function buildTriMapShowAll() {
  return new Map(); 
}

function buildTriMapHideAll(names) {
  const m = new Map();
  for (const n of names) m.set(n, "hide");
  return m;
}


function SectionHeader({ title, onClear }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-bold text-teal-500">{title}</h3>
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-slate-400 hover:text-slate-200 transition"
      >
        取消
      </button>
    </div>
  );
}

function Pill({ active, tri, children, onClick, onDoubleClick }) {
  const className = [
    "px-2 py-1 text-xs rounded-lg border transition select-none",
    "whitespace-nowrap",
    active
      ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
      : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
    tri === "force" ? "ring-1 ring-emerald-400/40" : "",
    tri === "hide" ? "opacity-50 line-through" : "",
  ].join(" ");

  const title = tri === "force" ? "強制顯示" : tri === "hide" ? "隱藏" : "顯示";

  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={className}
      title={title}
    >
      {children}
    </button>
  );
}

// 分段按鈕
function Segmented({ value, onChange, options, size = "sm" }) {
  const pad = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2 text-base";

  return (
    <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
      {options.map((opt, idx) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "flex-1 transition",
              pad,
              idx !== 0 ? "border-l border-slate-800" : "",
              active
                ? "bg-sky-600/20 text-sky-200"
                : "text-slate-200 hover:bg-slate-800/50",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function isTaiwanLike(name) {
    const norm = String(name || "").replace("臺", "台").trim();
    return norm === "台灣" || norm.includes("日治台灣");
}
function isTW(name) {
    const norm = String(name || "").replace("臺", "台").trim();
    return norm === "台灣";
}
function isJP_TW(name) {
    const norm = String(name || "").replace("臺", "台").trim();
    return norm === ("日治台灣");
}

function getTri(triMap, name) {
    return triMap.get(name) || "show"; // show | hide | force
}

function deriveCountryUi(countryTri, names, countryCoMode) {
    const taiwanNames = names.filter(isTaiwanLike);
    const foreignNames = names.filter((n) => !isTaiwanLike(n));

    const hasForce = names.some((n) => getTri(countryTri, n) === "force");

    const allSelected = names.length > 0 && names.every((n) => getTri(countryTri, n) !== "hide");
    const allHidden = names.length > 0 && names.every((n) => getTri(countryTri, n) === "hide");

    const taiwanSelected = taiwanNames.some((n) => getTri(countryTri, n) !== "hide");
    const taiwanAnyForce = taiwanNames.some((n) => getTri(countryTri, n) === "force");
    const taiwanAllHidden = taiwanNames.length > 0 && taiwanNames.every((n) => getTri(countryTri, n) === "hide");

    const foreignAnySelected = foreignNames.some((n) => getTri(countryTri, n) !== "hide");
    const foreignAllHidden = foreignNames.length > 0 && foreignNames.every((n) => getTri(countryTri, n) === "hide");

    const twExists = names.some(isTW);
    const jpTwExists = names.some(isJP_TW);

    const twTri = twExists ? getTri(countryTri, names.find(isTW)) : null;
    const jpTwTri = jpTwExists ? getTri(countryTri, names.find(isJP_TW)) : null;

    const twSelected = twExists ? twTri !== "hide" : false;
    const jpTwSelected = jpTwExists ? jpTwTri !== "hide" : false;

    const _bothSelected = twExists && jpTwExists && twSelected && jpTwSelected;
    const bothHidden = twExists && jpTwExists && !twSelected && !jpTwSelected;

    const coInvalid = foreignAllHidden || bothHidden;

    // ----- 既有按鈕判斷（但 coMode 會覆蓋它們） -----
    const showAllOn = allSelected && !hasForce;
    const hideAllOn = allHidden && !hasForce;
    const foreignOn = taiwanAllHidden && !taiwanAnyForce && foreignAnySelected;

    const taiwanForceCount = taiwanNames.filter((n) => getTri(countryTri, n) === "force").length;
    const localOn = taiwanSelected && foreignAllHidden && !(taiwanForceCount === 2);

    // ----- 核心：co 只在「手動啟動」且「未失效」時亮 -----
    const coOn = !!countryCoMode && !coInvalid;

    // 依優先順序決定亮哪顆：coMode 優先覆蓋其他
    let presetUi = "custom";
    if (coOn) presetUi = "co";
    else if (showAllOn) presetUi = "showAll";
    else if (hideAllOn) presetUi = "hideAll";
    else if (foreignOn) presetUi = "foreign";
    else if (localOn) presetUi = "local";

    const hint =
    presetUi === "co"
        ? "已排除由台灣單獨製作的台灣本土作品"
        : presetUi === "foreign"
        ? "僅包含在台灣拍攝或/和設定在台灣的作品"
        : presetUi === "local"
        ? "由台灣單獨製作的本土作品"
        : "";

    return {
    presetUi,
    hint,
    hintEnabled: presetUi === "co" || presetUi === "foreign" || presetUi === "local",
    coInvalid, // 讓外面可以用
    };
}

function FilterModal({
    open,
    onClose,

    statusCounts,
    countryCounts,
    genreCounts,
    langCounts,

    tempFilters,
    setTempFilters,

    dateFormatWarning,
    onResetAll,
    onApply,
    onConfirm,
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);

        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", onKey);
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
        };
        }, [open, onClose]);

    useEffect(() => {
        if (!open) return;
        if (!tempFilters.countryCoMode) return;

        const names = countryCounts.map((x) => x.name);
        const ui = deriveCountryUi(tempFilters.countryTri, names, tempFilters.countryCoMode);

        if (ui.coInvalid) {
        setTempFilters((f) => ({ ...f, countryCoMode: false, countryPreset: "none" }));
        }
    }, [open, tempFilters.countryCoMode, tempFilters.countryTri, countryCounts]);

    if (!open) return null;

    // 允許使用者手動打 YYYY/MM/DD，也允許 YYYY-MM-DD
    const normalizeDateText = (v) => String(v || "").trim().replaceAll("/", "-");

    // 轉給 <input type="date"> 用（必須是 YYYY-MM-DD 才能顯示）
    const toNativeDateValue = (v) => {
      const n = normalizeDateText(v);
      return /^\d{4}-\d{2}-\d{2}$/.test(n) ? n : "";
    };

    return createPortal(
    <div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
    >
        <div
        className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="min-w-0">
            <div className="text-white font-bold">進階過濾</div>
            </div>

            <div className="flex items-center gap-2">
                {dateFormatWarning ? (
                    <span className="text-red-400 text-xs font-semibold">
                      請填入正確的日期格式！
                    </span>
                  ) : null}
                <button
                    type="button"
                    onClick={onResetAll}
                    className="h-9 px-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 text-slate-100 text-sm transition"
                >
                    全部取消
                </button>
                <button
                    type="button"
                    onClick={() => onApply?.()}
                    className="h-9 px-3 rounded-xl bg-slate-600 hover:bg-slate-400 text-white text-sm font-semibold transition"
                 >
                    套用
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm?.()}
                    className="h-9 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition"
                 >
                    確定
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 text-slate-100 transition"
                    title="關閉"
                >
                    <X size={18} />
                </button>
            </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto max-h-[calc(85vh-56px)] space-y-6">
            {/* 類別 */}
            <div className="space-y-3">
            <SectionHeader
                title="類別"
                onClear={() => setTempFilters((f) => ({ ...f, hideTypes: { movies: false, series: false, games: false } }))}
            />
            <div className="flex flex-wrap gap-2">
                {[
                ["movies", "隱藏電影"],
                ["series", "隱藏影集"],
                ["games", "隱藏遊戲"],
                ].map(([k, label]) => (
                <button
                    key={k}
                    type="button"
                    onClick={() =>
                    setTempFilters((f) => ({ ...f, hideTypes: { ...f.hideTypes, [k]: !f.hideTypes[k] } }))
                    }
                    className={[
                    "px-3 py-2 rounded-xl border text-sm transition",
                    tempFilters.hideTypes[k]
                        ? "bg-red-600/15 border-red-500/30 text-red-200"
                        : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                    ].join(" ")}
                >
                    {label}
                </button>
                ))}
            </div>
            </div>

            {/* 狀態 */}
            <div className="space-y-3">
            <SectionHeader
                title="狀態"
                onClear={() => setTempFilters((f) => ({ ...f, statusMode: "all", statusHidden: new Set() }))}
            />

            <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                    type="button"
                    onClick={() =>
                    setTempFilters((f) => ({
                        ...f,
                        statusMode: "all",
                        statusHidden: new Set(), // 全部顯示
                    }))
                    }
                    className={[
                    "px-3 py-2 rounded-xl border transition",
                    tempFilters.statusMode === "all"
                        ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                        : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                    ].join(" ")}
                >
                    全選
                </button>
                <button
                    type="button"
                    onClick={() =>
                    setTempFilters((f) => ({
                        ...f,
                        statusMode: "none",
                        statusHidden: new Set(statusCounts.map((x) => x.name)), // 全部隱藏
                    }))
                    }
                    className={[
                    "px-3 py-2 rounded-xl border transition",
                    tempFilters.statusMode === "none"
                        ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                        : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                    ].join(" ")}
                >
                    全不選
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {statusCounts.map((x) => {
                const hidden = tempFilters.statusHidden.has(x.name);
                return (
                    <Pill
                    key={x.name}
                    active={!hidden}
                    tri={hidden ? "hide" : "show"}
                    onClick={() => {
                        setTempFilters((f) => {
                            const next = new Set(f.statusHidden);
                            if (next.has(x.name)) next.delete(x.name);
                            else next.add(x.name);

                            const allHidden = next.size === statusCounts.length;
                            const noneHidden = next.size === 0;
                            const mode = allHidden ? "none" : noneHidden ? "all" : "custom";

                            return { ...f, statusHidden: next, statusMode: mode };
                        });
                        }}
                    >
                        {x.name} ({x.current}/{x.total})
                    </Pill>
                );
                })}
            </div>
            </div>

            {/* 發布日期(排序用) */}
            <div className="space-y-3">
            <SectionHeader
                title="發布日期"
                onClear={() =>
                setTempFilters((f) => ({ ...f, dateRange: { start: "", end: "", hideNoDate: false } }))
                }
            />
            <div className="flex flex-col flex-row items-center gap-2">
              {/* Start */}
              <div className="relative w-full flex-1">
                <input
                  className="h-10 w-full rounded-xl bg-slate-900/50 border border-slate-800 px-3 pr-10 text-sm text-slate-100 outline-none focus:border-sky-500/60"
                  placeholder="開始日期 YYYY/MM/DD"
                  value={tempFilters.dateRange.start}
                  onChange={(e) =>
                    setTempFilters((f) => ({
                      ...f,
                      dateRange: { ...f.dateRange, start: normalizeDateText(e.target.value) },
                    }))
                  }
                />

                {/* 日曆 icon + 原生 date input（點 icon 會打開原生日曆） */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 flex items-center justify-center">
                  <Calendar size={16} className="text-slate-300 pointer-events-none" />
                  <input
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    value={toNativeDateValue(tempFilters.dateRange.start)}
                    onChange={(e) =>
                      setTempFilters((f) => ({
                        ...f,
                        dateRange: { ...f.dateRange, start: e.target.value }, // e.target.value 永遠是 YYYY-MM-DD
                      }))
                    }
                  />
                </div>
              </div>

              <span className="text-slate-400 px-1">~</span>

              {/* End */}
              <div className="relative w-full flex-1">
                <input
                  className="h-10 w-full rounded-xl bg-slate-900/50 border border-slate-800 px-3 pr-10 text-sm text-slate-100 outline-none focus:border-sky-500/60"
                  placeholder="結束日期 YYYY/MM/DD"
                  value={tempFilters.dateRange.end}
                  onChange={(e) =>
                    setTempFilters((f) => ({
                      ...f,
                      dateRange: { ...f.dateRange, end: normalizeDateText(e.target.value) },
                    }))
                  }
                />

                <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 flex items-center justify-center">
                  <Calendar size={16} className="text-slate-300 pointer-events-none" />
                  <input
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    value={toNativeDateValue(tempFilters.dateRange.end)}
                    onChange={(e) =>
                      setTempFilters((f) => ({
                        ...f,
                        dateRange: { ...f.dateRange, end: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <label className="px-3 text-xs text-slate-200 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={tempFilters.dateRange.hideNoDate}
                    onChange={(e) =>
                    setTempFilters((f) => ({ ...f, dateRange: { ...f.dateRange, hideNoDate: e.target.checked } }))
                    }
                />
                隱藏無發布日期
                </label>
            </div>

            {/* 製作國家或地區：三態（顯示/隱藏/強制顯示） */}
            <div className="space-y-3">
                <SectionHeader
                    title="製作國家或地區"
                    onClear={() => setTempFilters((f) => ({ ...f, countryTri: new Map(), countryPreset: "none", countryCoMode: false }))}
                />

                {(() => {
                    const names = countryCounts.map((x) => x.name);
                    const ui = deriveCountryUi(tempFilters.countryTri, names, tempFilters.countryCoMode);

                    const applyPreset = (k) => {
                        setTempFilters((f) => {
                        const names2 = countryCounts.map((x) => x.name);

                        // 其他按鈕：一律關閉 coMode
                        if (k !== "co") {
                            let nextTri = f.countryTri;

                            if (k === "showAll") {
                            nextTri = new Map();
                            } else if (k === "hideAll") {
                            nextTri = new Map();
                            for (const n of names2) nextTri.set(n, "hide");
                            } else if (k === "foreign") {
                            nextTri = new Map();
                            for (const n of names2) nextTri.set(n, isTaiwanLike(n) ? "hide" : "show");
                            } else if (k === "local") {
                            nextTri = new Map();
                            for (const n of names2) nextTri.set(n, isTaiwanLike(n) ? "show" : "hide");
                            }

                            return {
                            ...f,
                            countryTri: nextTri,
                            countryPreset: k,
                            countryCoMode: false,
                            };
                        }

                        // k === "co"
                        const willTurnOn = !f.countryCoMode;

                        if (willTurnOn) {
                            // 啟動 co：全選，並開啟 coMode（覆蓋全選按鈕的自動判斷）
                            const nextTri = new Map();
                            for (const n of names2) nextTri.set(n, "show");

                            return {
                            ...f,
                            countryTri: nextTri,
                            countryPreset: "co",
                            countryCoMode: true,
                            };
                        }

                        // 再按一次：只熄滅 coMode，不改 tri（你要求）
                        return {
                            ...f,
                            countryPreset: "none",
                            countryCoMode: false,
                        };
                        });
                    };

                    return (
                        <>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {[
                            ["showAll", "全選"],
                            ["hideAll", "全不選"],
                            ["foreign", "外國製作"],
                            ["co", "國際合作"],
                            ["local", "本土製作"],
                            ].map(([k, label]) => (
                            <button
                                key={k}
                                type="button"
                                onClick={() => applyPreset(k)}
                                className={[
                                "px-3 py-2 rounded-xl border transition",
                                ui.presetUi === k
                                    ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                    : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                                ].join(" ")}
                            >
                                {label}
                            </button>
                            ))}
                        </div>

                        {ui.hintEnabled && ui.hint && (
                            <div className="text-xs text-slate-400 -mt-1">{ui.hint}</div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {countryCounts.map((x) => {
                            const tri = tempFilters.countryTri.get(x.name) || "show"; // show | hide | force
                            return (
                                <Pill
                                key={x.name}
                                active={tri !== "hide"}
                                tri={tri === "force" ? "force" : tri === "hide" ? "hide" : "show"}
                                onClick={() => {
                                    setTempFilters((f) => {
                                    const next = new Map(f.countryTri);
                                    const cur = next.get(x.name) || "show";
                                    const nxt = cur === "hide" ? "show" : "hide";
                                    next.set(x.name, nxt);
                                    return { ...f, countryTri: next, countryPreset: "custom" };
                                    });
                                }}
                                onDoubleClick={() => {
                                    setTempFilters((f) => {
                                    const next = new Map(f.countryTri);
                                    next.set(x.name, "force");
                                    return { ...f, countryTri: next, countryPreset: "custom" };
                                    });
                                }}
                                >
                                {x.name} ({x.current}/{x.total})
                                </Pill>
                            );
                            })}
                        </div>
                        </>
                    );
                    })()}
                </div>

                {/* 類型：三態（顯示/隱藏/強制顯示） */}
                <div className="space-y-3">
                <SectionHeader
                    title="類型"
                    onClear={() => setTempFilters((f) => ({ ...f, genreTri: new Map(), genrePreset: "none" }))}
                />

                <div className="flex flex-wrap gap-2 text-xs">
                    {[
                        ["showAll", "全選"],
                        ["hideAll", "全不選"],
                    ].map(([k, label]) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => {
                        setTempFilters((f) => {
                            const names = genreCounts.map((x) => x.name);
                            const nextTri = (k === "showAll")
                            ? buildTriMapShowAll(names)
                            : buildTriMapHideAll(names);
                            return { ...f, genrePreset: k, genreTri: nextTri };
                        });
                        }}
                        className={[
                        "px-3 py-2 rounded-xl border transition",
                        tempFilters.genrePreset === k
                            ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                            : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    {genreCounts.map((x) => {
                    const tri = tempFilters.genreTri.get(x.name) || "show";
                    return (
                        <Pill
                        key={x.name}
                        active={tri !== "hide"}
                        tri={tri === "force" ? "force" : tri === "hide" ? "hide" : "show"}
                        onClick={() => {
                            setTempFilters((f) => {
                            const next = new Map(f.genreTri);
                            const cur = next.get(x.name) || "show";
                            const nxt = cur === "hide" ? "show" : "hide";
                            next.set(x.name, nxt);
                            return { ...f, genreTri: next, genrePreset: "custom" };
                            });
                        }}
                        onDoubleClick={() => {
                            setTempFilters((f) => {
                            const next = new Map(f.genreTri);
                            next.set(x.name, "force");
                            return { ...f, genreTri: next, genrePreset: "custom" };
                            });
                        }}
                        >
                        {x.name} ({x.current}/{x.total})
                        </Pill>
                    );
                    })}
                </div>
            </div>

            {/* 支援語言 */}
            <div className="space-y-3">
                <SectionHeader
                title="支援語言"
                onClear={() =>
                    setTempFilters((f) => ({
                    ...f,
                    langMode: "none",
                    langMV: {
                        active: "orig",
                        hidden: { orig: new Set(), dub: new Set(), sub: new Set() },
                        preset: { orig: "all", dub: "all", sub: "all" },
                    },
                    langGM: {
                        active: "sub",
                        hidden: { sub: new Set(), voice: new Set(), ui: new Set() },
                        preset: { sub: "all", voice: "all", ui: "all" },
                    },
                    }))
                }
                />

                <Segmented
                    value={tempFilters.langMode}
                    onChange={(v) => setTempFilters((f) => ({ ...f, langMode: v }))}
                    options={[
                    { value: "mv", label: "電影 / 影集" },
                    { value: "gm", label: "遊戲" },
                    ]}
                />

                {/* 第二層 + 第三層：依選到的 mode 顯示 */}
                {tempFilters.langMode === "mv" && (
                <div className="space-y-3">
                    {/* 第二層：原/配/字 */}
                    <Segmented
                        value={tempFilters.langMV.active}
                        onChange={(v) =>
                        setTempFilters((f) => ({
                            ...f,
                            langMV: { ...f.langMV, active: v },
                        }))
                        }
                        options={[
                        { value: "orig", label: "原音" },
                        { value: "dub", label: "配音" },
                        { value: "sub", label: "字幕" },
                        ]}
                    />

                    {/* 第三層：語言清單 + 全選/全不選 */}
                    {(() => {
                    const branch = tempFilters.langMV.active; // orig/dub/sub
                    const list = langCounts?.mv?.[branch] ?? [];
                    const hiddenSet = tempFilters.langMV.hidden[branch] ?? new Set();
                    const allNames = list.map((x) => x.name);

                    const setAll = () => {
                        setTempFilters((f) => ({
                        ...f,
                        langMV: {
                            ...f.langMV,
                            hidden: { ...f.langMV.hidden, [branch]: new Set() },
                            preset: { ...f.langMV.preset, [branch]: "all" },
                        },
                        }));
                    };

                    const setNone = () => {
                        setTempFilters((f) => ({
                        ...f,
                        langMV: {
                            ...f.langMV,
                            hidden: { ...f.langMV.hidden, [branch]: new Set(allNames) },
                            preset: { ...f.langMV.preset, [branch]: "none" },
                        },
                        }));
                    };

                    return (
                        <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <button
                            type="button"
                            onClick={setAll}
                            className={[
                                "px-3 py-2 rounded-xl border transition",
                                tempFilters.langMV.preset[branch] === "all"
                                ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                            ].join(" ")}
                            >
                            全選
                            </button>
                            <button
                            type="button"
                            onClick={setNone}
                            className={[
                                "px-3 py-2 rounded-xl border transition",
                                tempFilters.langMV.preset[branch] === "none"
                                ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                            ].join(" ")}
                            >
                            全不選
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {list.map((x) => {
                            const hidden = hiddenSet.has(x.name);
                            return (
                                <Pill
                                key={x.name}
                                active={!hidden}
                                tri={hidden ? "hide" : "show"}
                                onClick={() => {
                                    setTempFilters((f) => {
                                    const curHidden = f.langMV.hidden[branch] ?? new Set();
                                    const next = new Set(curHidden);
                                    if (next.has(x.name)) next.delete(x.name);
                                    else next.add(x.name);

                                    const allHidden = next.size === allNames.length && allNames.length > 0;
                                    const noneHidden = next.size === 0;
                                    const preset = allHidden ? "none" : noneHidden ? "all" : "custom";

                                    return {
                                        ...f,
                                        langMV: {
                                        ...f.langMV,
                                        hidden: { ...f.langMV.hidden, [branch]: next },
                                        preset: { ...f.langMV.preset, [branch]: preset },
                                        },
                                    };
                                    });
                                }}
                                >
                                {x.name} ({x.current}/{x.total})
                                </Pill>
                            );
                            })}
                            {list.length === 0 && (
                            <div className="text-sm text-slate-500">（沒有可顯示的資料）</div>
                            )}
                        </div>
                        </div>
                    );
                    })()}
                </div>
                )}

                {tempFilters.langMode === "gm" && (
                <div className="space-y-3">
                    {/* 第二層：字/語/介 */}
                    <Segmented
                        value={tempFilters.langGM.active}
                        onChange={(v) =>
                        setTempFilters((f) => ({
                            ...f,
                            langGM: { ...f.langGM, active: v },
                        }))
                        }
                        options={[
                        { value: "sub", label: "字幕" },
                        { value: "voice", label: "語音" },
                        { value: "ui", label: "介面" },
                        ]}
                    />

                    {/* 第三層：語言清單 + 全選/全不選 */}
                    {(() => {
                    const branch = tempFilters.langGM.active; // sub/voice/ui
                    const list = langCounts?.gm?.[branch] ?? [];
                    const hiddenSet = tempFilters.langGM.hidden[branch] ?? new Set();
                    const allNames = list.map((x) => x.name);

                    const setAll = () => {
                        setTempFilters((f) => ({
                        ...f,
                        langGM: {
                            ...f.langGM,
                            hidden: { ...f.langGM.hidden, [branch]: new Set() },
                            preset: { ...f.langGM.preset, [branch]: "all" },
                        },
                        }));
                    };

                    const setNone = () => {
                        setTempFilters((f) => ({
                        ...f,
                        langGM: {
                            ...f.langGM,
                            hidden: { ...f.langGM.hidden, [branch]: new Set(allNames) },
                            preset: { ...f.langGM.preset, [branch]: "none" },
                        },
                        }));
                    };

                    return (
                        <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <button
                            type="button"
                            onClick={setAll}
                            className={[
                                "px-3 py-2 rounded-xl border transition",
                                tempFilters.langGM.preset[branch] === "all"
                                ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                            ].join(" ")}
                            >
                            全選
                            </button>
                            <button
                            type="button"
                            onClick={setNone}
                            className={[
                                "px-3 py-2 rounded-xl border transition",
                                tempFilters.langGM.preset[branch] === "none"
                                ? "bg-sky-600/20 border-sky-500/40 text-sky-200"
                                : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-800/50",
                            ].join(" ")}
                            >
                            全不選
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {list.map((x) => {
                            const hidden = hiddenSet.has(x.name);
                            return (
                                <Pill
                                key={x.name}
                                active={!hidden}
                                tri={hidden ? "hide" : "show"}
                                onClick={() => {
                                    setTempFilters((f) => {
                                    const curHidden = f.langGM.hidden[branch] ?? new Set();
                                    const next = new Set(curHidden);
                                    if (next.has(x.name)) next.delete(x.name);
                                    else next.add(x.name);

                                    const allHidden = next.size === allNames.length && allNames.length > 0;
                                    const noneHidden = next.size === 0;
                                    const preset = allHidden ? "none" : noneHidden ? "all" : "custom";

                                    return {
                                        ...f,
                                        langGM: {
                                        ...f.langGM,
                                        hidden: { ...f.langGM.hidden, [branch]: next },
                                        preset: { ...f.langGM.preset, [branch]: preset },
                                        },
                                    };
                                    });
                                }}
                                >
                                {x.name} ({x.current}/{x.total})
                                </Pill>
                            );
                            })}
                            {list.length === 0 && (
                            <div className="text-sm text-slate-500">（沒有可顯示的資料）</div>
                            )}
                        </div>
                        </div>
                    );
                    })()}
                </div>
                )}
            </div>

            {/* 主視覺圖 */}
            <div className="space-y-3">
            <SectionHeader
                title="主視覺圖"
                onClear={() => setTempFilters((f) => ({ ...f, hideNoMainImage: false }))}
            />
            <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                <input
                type="checkbox"
                checked={tempFilters.hideNoMainImage}
                onChange={(e) => setTempFilters((f) => ({ ...f, hideNoMainImage: e.target.checked }))}
                />
                隱藏不含主視覺圖的作品
            </label>
            </div>
        </div>
        </div>
    </div>,
    document.body
    );
}

function parseYMDLoose(s) {
  // 允許 YYYY / YYYY-MM / YYYY-MM-DD（也接受 YYYY/MM/DD）
  const t = String(s || "").trim().replaceAll("/", "-");
  if (!t) return null;

  const m = t.match(/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/);
  if (!m) return null;

  const y = Number(m[1]);
  const mo = m[2] ? Number(m[2]) : null;
  const d = m[3] ? Number(m[3]) : null;

  if (!Number.isFinite(y) || y <= 0) return null;

  if (mo != null) {
    if (!Number.isFinite(mo) || mo < 1 || mo > 12) return null;
  }
  if (d != null) {
    if (mo == null) return null; // 不允許 YYYY--DD
    if (!Number.isFinite(d) || d < 1) return null;
    const last = lastDayOfMonth(y, mo);
    if (d > last) return null;
  }

  return { y, mo, d };
}

function lastDayOfMonth(y, mo /* 1-12 */) {
  return new Date(y, mo, 0).getDate();
}

function expandToRange(parts) {
  // parts: {y, mo?, d?}
  // 回傳 [minDate, maxDate]（Date 物件）
  const { y, mo, d } = parts;
  if (!mo) {
    return [new Date(y, 0, 1), new Date(y, 11, 31)];
  }
  if (!d) {
    return [new Date(y, mo - 1, 1), new Date(y, mo - 1, lastDayOfMonth(y, mo))];
  }
  return [new Date(y, mo - 1, d), new Date(y, mo - 1, d)];
}

function rangesOverlap(a0, a1, b0, b1) {
  return a0 <= b1 && b0 <= a1;
}

function matchTriTags(tagList, triMap) {
  const tags = tagList || [];
  const forced = [];
  const hidden = new Set();

  for (const [k, v] of triMap?.entries?.() || []) {
    if (v === "force") forced.push(k);
    else if (v === "hide") hidden.add(k);
  }

  // force：至少命中一個 force tag（你 UI 的「雙擊強制顯示」更符合 OR）
  if (forced.length > 0) {
    const hasForce = tags.some((t) => forced.includes(t));
    if (!hasForce) return false;

    // 仍尊重 hidden，但不把「同時被 force 的 tag」當成 hidden
    for (const t of tags) {
      if (hidden.has(t) && !forced.includes(t)) return false;
    }
    return true;
  }

  // 沒 force：只要命中 hidden 就排除
  for (const t of tags) {
    if (hidden.has(t)) return false;
  }
  return true;
}

// 進階篩選邏輯
function applyAdvancedFilters(list, f) {
  return (list || []).filter((work) => {
    // 1) 類別隱藏
    if (f.hideTypes?.[work.work_type_key]) return false;

    // 2) 主視覺圖
    if (f.hideNoMainImage && !work.main_image_url) return false;

    // 3) 狀態：statusHidden 裡的是「要隱藏的狀態」
    if (f.statusHidden?.has?.(work.status)) return false;

    // 4) 發布日期區間（YYYY / YYYY-MM / YYYY-MM-DD 都要能判斷）
    const hasAnyRange = !!(f.dateRange?.start || f.dateRange?.end);
    if (f.dateRange?.hideNoDate && !work.release_date_simp) return false;

    if (hasAnyRange) {
      const wParts = parseYMDLoose(work.release_date_simp);
      if (!wParts) {
        // 沒日期：若使用者勾 hideNoDate 上面已擋掉；沒勾就放行
      } else {
        const [w0, w1] = expandToRange(wParts);

        const sParts = parseYMDLoose(f.dateRange.start);
        const eParts = parseYMDLoose(f.dateRange.end);

        // 起訖未填：視為無限
        const s0 = sParts ? expandToRange(sParts)[0] : new Date(-8640000000000000);
        const e1 = eParts ? expandToRange(eParts)[1] : new Date(8640000000000000);

        // 視為「作品日期區間」與「篩選區間」有交集就算在期間內
        // 這會自然符合企劃書的「YYYY 或 YYYY-MM 在同年/同月可包含」:contentReference[oaicite:7]{index=7}
        if (!rangesOverlap(w0, w1, s0, e1)) return false;
      }
    }

    // 5) 製作國家或地區（三態 + 國際合作 coMode）
    const countries = parseCommaList(work.countries); // 你檔案已存在 parseCommaList :contentReference[oaicite:8]{index=8}
    if (!matchTriTags(countries, f.countryTri)) return false;

    // 國際合作：排除「只有台灣/日治台灣」的本土作品:contentReference[oaicite:9]{index=9}
    if (f.countryCoMode) {
      const hasAny = countries.length > 0;
      const allTaiwanLike = hasAny && countries.every((c) => isTaiwanLike(c));
      if (allTaiwanLike) return false;
    }

    // 6) 類型（三態）
    const genres = parseCommaList(work.genre_tags);
    if (!matchTriTags(genres, f.genreTri)) return false;

    // 7) 支援語言（依你 UI：mv / gm / none；並自動互斥隱藏類別）:contentReference[oaicite:10]{index=10}
    if (f.langMode === "mv") {
      if (work.work_type_key === "games") return false;

      const parsed = parseSupportedLanguages(work.supported_languages);
      const branch = f.langMV.active; // orig | dub | sub
      const wLangs = parsed.mv[branch] || [];
      const hiddenSet = f.langMV.hidden[branch] || new Set();

      if (wLangs.some((x) => hiddenSet.has(x))) return false;
    } else if (f.langMode === "gm") {
      if (work.work_type_key !== "games") return false;

      const parsed = parseSupportedLanguages(work.supported_languages);
      const branch = f.langGM.active; // sub | voice | ui
      const wLangs = parsed.gm[branch] || [];
      const hiddenSet = f.langGM.hidden[branch] || new Set();

      if (wLangs.some((x) => hiddenSet.has(x))) return false;
    }

    return true;
  });
}

// 驗證並正規化日期區間輸入
function validateAndNormalizeDateRange(dateRange) {
  const startText = String(dateRange?.start || "").trim();
  const endText = String(dateRange?.end || "").trim();

  const startNorm = startText.replaceAll("/", "-");
  const endNorm = endText.replaceAll("/", "-");

  const sParts = startNorm ? parseYMDLoose(startNorm) : null;
  const eParts = endNorm ? parseYMDLoose(endNorm) : null;

  if (startNorm && !sParts) return { ok: false };
  if (endNorm && !eParts) return { ok: false };

  // 都空：OK
  if (!sParts && !eParts) return { ok: true, start: "", end: "", swapped: false };

  // 取「比較用」邊界：start 用最小日；end 用最大日
  const sMin = sParts ? expandToRange(sParts)[0] : new Date(-8640000000000000);
  const eMax = eParts ? expandToRange(eParts)[1] : new Date(8640000000000000);

  // 若填反：互換（只在兩邊都有填時才需要互換字串）
  if (sParts && eParts && sMin > eMax) {
    return { ok: true, start: endNorm, end: startNorm, swapped: true };
  }

  return { ok: true, start: startNorm, end: endNorm, swapped: false };
}

export default function App() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialState = useMemo(getHashPath, []);
  const [view, setView] = useState(initialState.view);
  const [selectedWorkId, setSelectedWorkId] = useState(initialState.workId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState("grid");

  const [sortKey, setSortKey] = useState("release_date_simp"); // 預設：發布日期(排序用)
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const [hoveredWorkId, setHoveredWorkId] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  const sortMenuRef = useRef(null);

  const [dateFormatWarning, setDateFormatWarning] = useState(false);

  const emptyTempFilters = useMemo(() => ({
      hideTypes: { movies: false, series: false, games: false },

      // status：用 Set 記錄「被隱藏的狀態」
      statusMode: "all", // all | none | custom
      statusHidden: new Set(),

      dateRange: { start: "", end: "", hideNoDate: false },

      // tri-state：show | hide | force
      countryPreset: "none",
      countryTri: new Map(),
      countryCoMode: false,

      genrePreset: "none",
      genreTri: new Map(),

      langMode: "none", // mv | gm | none

      langMV: {
          active: "orig",          // orig | dub | sub
          hidden: {
            orig: new Set(),       // 隱藏哪些語言
            dub: new Set(),
            sub: new Set(),
          },
          preset: {
            orig: "all",           // all | none | custom (用來亮按鈕)
            dub: "all",
            sub: "all",
          },
      },

      langGM: {
          active: "sub",           // sub | voice | ui
          hidden: {
            sub: new Set(),
            voice: new Set(),
            ui: new Set(),
          },
            preset: {
            sub: "all",
            voice: "all",
            ui: "all",
          },
      },

      hideNoMainImage: false,
    }), []);

    // 深拷貝：避免 Map/Set 參考共用（很重要）
    function cloneFilterState(f) {
        return {
        ...f,
        hideTypes: { ...f.hideTypes },

        statusHidden: new Set([...f.statusHidden]),
        dateRange: { ...f.dateRange },

        countryTri: new Map([...f.countryTri]),
        genreTri: new Map([...f.genreTri]),

        langMV: {
            ...f.langMV,
            hidden: {
            orig: new Set([...f.langMV.hidden.orig]),
            dub: new Set([...f.langMV.hidden.dub]),
            sub: new Set([...f.langMV.hidden.sub]),
            },
            preset: { ...f.langMV.preset },
        },

        langGM: {
            ...f.langGM,
            hidden: {
            sub: new Set([...f.langGM.hidden.sub]),
            voice: new Set([...f.langGM.hidden.voice]),
            ui: new Set([...f.langGM.hidden.ui]),
            },
            preset: { ...f.langGM.preset },
        },
        };
    }

    const [filters, setFilters] = useState(() => cloneFilterState(emptyTempFilters)); // 已套用的過濾器
    const [tempFilters, setTempFilters] = useState(() => cloneFilterState(emptyTempFilters)); // 只給 UI 編輯用

    const resetAllFiltersUI = () => {
        setTempFilters(emptyTempFilters);
    };

    const tryApplyTempFilters = (shouldClose) => {
    const vr = validateAndNormalizeDateRange(tempFilters.dateRange);

    if (!vr.ok) {
        setDateFormatWarning(true); // ✅ 顯示警告
        return; // ✅ 不套用、不關閉
        }

        setDateFormatWarning(false); // ✅ 成功就隱藏警告

        // ✅ 若有 swap 或 normalize，順便更新 tempFilters 讓 UI 顯示正確（可選但建議）
        const nextTemp = cloneFilterState(tempFilters);
        nextTemp.dateRange = { ...nextTemp.dateRange, start: vr.start, end: vr.end };
        setTempFilters(nextTemp);

        // ✅ 真正套用（filters）
        setFilters(cloneFilterState(nextTemp));

        if (shouldClose) setFilterOpen(false);
    };

    // 套用：只套用不關
    const onApply = () => tryApplyTempFilters(false);

    // 確定：套用+關閉
    const onConfirm = () => tryApplyTempFilters(true);

  useEffect(() => {
      if (!filterOpen) return;
      setTempFilters(cloneFilterState(filters));
  }, [filterOpen, filters]);

  const selectedWork = useMemo(() => {
    if (!works.length || !selectedWorkId) return null;
    return works.find((w) => w.id === selectedWorkId) || null;
  }, [works, selectedWorkId]);

  const fullImageList = useMemo(() => {
    if (!selectedWork) return [];
    const w = selectedWork;
    const list = [];
    if (w.main_image_url) list.push(w.main_image_url);

    const other = w.other_image_urls || "";
    if (other) {
      String(other)
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
        .forEach((url) => {
          if (!list.includes(url)) list.push(url);
        });
    }
    return list;
  }, [selectedWork]);

  const handleOpenModal = (initialIndex = 0) => {
    if (!selectedWork || !fullImageList.length) return;
    setModalImageIndex(initialIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleNextImage = useCallback(() => {
    setModalImageIndex((prev) => (prev + 1) % fullImageList.length);
  }, [fullImageList.length]);
  const handlePrevImage = useCallback(() => {
    setModalImageIndex((prev) => (prev - 1 + fullImageList.length) % fullImageList.length);
  }, [fullImageList.length]);

  useEffect(() => {
    const handleHashChange = () => {
      const { view, workId } = getHashPath();
      setView(view);
      setSelectedWorkId(workId);
      if (isModalOpen) setIsModalOpen(false);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isModalOpen]);

  const fetchWorks = async () => {
    if (works.length > 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data?.status === "success") {
        setWorks(normalizeWorks(data));
      } else {
        throw new Error("API 回傳錯誤：status 非 success");
      }
    } catch (err) {
      console.error(err);
      setError("無法連接 API 或資料格式錯誤");
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== "home" && works.length === 0 && !loading) fetchWorks();
  }, [view]);

  useEffect(() => {
      function onDocMouseDown(e) {
        if (!sortMenuOpen) return; // 只有開著才判斷
        const el = sortMenuRef.current;
        if (!el) return;
        if (!el.contains(e.target)) {
          setSortMenuOpen(false);
        }
      }

      document.addEventListener("mousedown", onDocMouseDown);
      return () => document.removeEventListener("mousedown", onDocMouseDown);
    }, [sortMenuOpen, setSortMenuOpen]);

  const filteredWorks = useMemo(() => {
    return applyAdvancedFilters(works, filters);
  }, [works, filters]);

  const SearchWorks = useMemo(() => {
    return applySearchFilter(filteredWorks, appliedSearch);
  }, [filteredWorks, appliedSearch]);

  const sortedWorks = useMemo(() => {
    let arr = Array.isArray(SearchWorks) ? [...SearchWorks] : [];

    if (sortKey === "episode_total_count") {
        arr = arr.filter((w) => w?.work_type_key === "series");
    } else if (sortKey === "runtime") {
        arr = arr.filter((w) => w?.work_type_key !== "games");
    }

    const dir = sortDir === "asc" ? 1 : -1;

    function placeNullLast(aVal, bVal, cmp) {
    const aNull = aVal === null || aVal === undefined || aVal === "";
    const bNull = bVal === null || bVal === undefined || bVal === "";
    // 缺值永遠排最後（不受遞增遞減影響）:contentReference[oaicite:5]{index=5}
    if (aNull && bNull) return 0;
    if (aNull) return 1;
    if (bNull) return -1;
    return cmp(aVal, bVal);
    }

    arr.sort((a, b) => {
    const aId = a?.id;
    const bId = b?.id;

    // 1) 發布日期(排序用) release_date_simp 特例:contentReference[oaicite:6]{index=6}
    if (sortKey === "release_date_simp") {
        const ad = parseLooseDateToNumber(a?.release_date_simp);
        const bd = parseLooseDateToNumber(b?.release_date_simp);

        const primary = placeNullLast(ad, bd, (x, y) => (x - y) * dir);
        if (primary !== 0) return primary;

        // 日期相同 -> 用編號排序，不受遞增遞減影響:contentReference[oaicite:7]{index=7}
        return compareId(aId, bId);
    }

    // 2) 編號 id 特例:contentReference[oaicite:8]{index=8}
    if (sortKey === "id") {
        return compareId(aId, bId) * dir;
    }

    // 3) 名稱 name 特例（先用中文；之後可擴充中/英切換）:contentReference[oaicite:9]{index=9}
    if (sortKey === "name") {
        const an = getSortName(a);
        const bn = getSortName(b);
        // 缺值就排最後（同樣遵守缺值永遠最後）
        return placeNullLast(an, bn, (x, y) => compareByEmbeddedNumberThenText(x, y) * dir);
    }

    // 4) 總集數 episode_total_count：電影/遊戲通常沒有 -> 自然會排最後；缺值永遠最後:contentReference[oaicite:10]{index=10}
    if (sortKey === "episode_total_count") {
        const ae = Number.isFinite(+a?.episode_total_count) ? +a.episode_total_count : null;
        const be = Number.isFinite(+b?.episode_total_count) ? +b.episode_total_count : null;
        return placeNullLast(ae, be, (x, y) => (x - y) * dir);
    }

    // 5) 片長 runtime：遊戲通常沒有 -> 自然最後；取最大數字；缺值永遠最後:contentReference[oaicite:11]{index=11}
    if (sortKey === "runtime") {
        const ar = parseRuntimeMax(a?.runtime);
        const br = parseRuntimeMax(b?.runtime);
        return placeNullLast(ar, br, (x, y) => (x - y) * dir);
    }

    // 6) 上次更新 last_update：同日用 id 當第二排序，不受遞增遞減影響:contentReference[oaicite:12]{index=12}
    if (sortKey === "last_update") {
        const ad = parseLooseDateToNumber(a?.last_update);
        const bd = parseLooseDateToNumber(b?.last_update);

        const primary = placeNullLast(ad, bd, (x, y) => (x - y) * dir);
        if (primary !== 0) return primary;

        return compareId(aId, bId);
    }

    return 0;
    });

    return arr;
  }, [SearchWorks, sortKey, sortDir]);

  function buildCountListFromCommaField(list, field) {
      const map = new Map();
      for (const w of list) {
        const items = parseCommaList(w?.[field]); // 你檔案內已經有 parseCommaList :contentReference[oaicite:3]{index=3}
        for (const it of items) map.set(it, (map.get(it) || 0) + 1);
      }
      return Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => (b.count - a.count) || compareByEmbeddedNumberThenText(a.name, b.name));
    }

    // ✅ Total counts：固定順序（只依賴 works）
    const statusCountsTotal = useMemo(() => buildStatusCountList(works), [works]);
    const countryCountsTotal = useMemo(() => buildCountListFromCommaField(works, "countries"), [works]);
    const genreCountsTotal   = useMemo(() => buildCountListFromCommaField(works, "genre_tags"), [works]);
    const langCountsTotal    = useMemo(() => buildLangCounts(works), [works]);

    // ✅ Current counts：跟著 filteredWorks 變動（只算數量）
    const statusCountsCur = useMemo(() => buildStatusCountList(filteredWorks), [filteredWorks]);
    const countryCountsCur = useMemo(() => buildCountListFromCommaField(filteredWorks, "countries"), [filteredWorks]);
    const genreCountsCur   = useMemo(() => buildCountListFromCommaField(filteredWorks, "genre_tags"), [filteredWorks]);
    const langCountsCur    = useMemo(() => buildLangCounts(filteredWorks), [filteredWorks]);

    // ✅ UI counts：用 Total 當底（永不消失），顯示 current/total
    const statusCountsUI  = useMemo(() => mergeCounts(statusCountsTotal, statusCountsCur), [statusCountsTotal, statusCountsCur]);
    const countryCountsUI = useMemo(() => mergeCounts(countryCountsTotal, countryCountsCur), [countryCountsTotal, countryCountsCur]);
    const genreCountsUI   = useMemo(() => mergeCounts(genreCountsTotal, genreCountsCur), [genreCountsTotal, genreCountsCur]);
    const langCountsUI    = useMemo(() => mergeLangCounts(langCountsTotal, langCountsCur), [langCountsTotal, langCountsCur]);


    function buildStatusCountList(list) {
        const map = new Map();
        for (const w of list || []) {
        const s = String(w?.status || "").trim() || "未知";
        map.set(s, (map.get(s) || 0) + 1);
        }
        return Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => (b.count - a.count) || compareByEmbeddedNumberThenText(a.name, b.name));
    }

    function toCountMap(countList) {
        const m = new Map();
        for (const x of countList || []) m.set(x.name, x.count || 0);
        return m;
    }

    // 用 totalList 的順序當底，把 currentList 的 count merge 進去
    function mergeCounts(totalList, currentList) {
        const curMap = toCountMap(currentList);
        return (totalList || []).map((t) => ({
        name: t.name,
        total: t.count || 0,
        current: curMap.get(t.name) || 0,
        }));
    }

    // 語言 counts：依照你原本邏輯，只是抽成可重用（list 可傳 works 或 filteredWorks）
    function buildLangCounts(list) {
        const mvOrig = [];
        const mvDub = [];
        const mvSub = [];
        const gmSub = [];
        const gmVoice = [];
        const gmUI = [];

        for (const w of list || []) {
        const parsed = parseSupportedLanguages(w?.supported_languages);

        if (w?.work_type_key === "movies" || w?.work_type_key === "series") {
            mvOrig.push(...parsed.mv.orig);
            mvDub.push(...parsed.mv.dub);
            mvSub.push(...parsed.mv.sub);
        }

        if (w?.work_type_key === "games") {
            gmSub.push(...parsed.gm.sub);
            gmVoice.push(...parsed.gm.voice);
            gmUI.push(...parsed.gm.ui);
        }
        }

        return {
        mv: {
            orig: buildCountListFromArray(mvOrig),
            dub: buildCountListFromArray(mvDub),
            sub: buildCountListFromArray(mvSub),
        },
        gm: {
            sub: buildCountListFromArray(gmSub),
            voice: buildCountListFromArray(gmVoice),
            ui: buildCountListFromArray(gmUI),
        },
        };
    }

    function mergeLangCounts(totalLang, currentLang) {
        const safe = (x) => x || [];
        return {
        mv: {
            orig: mergeCounts(safe(totalLang?.mv?.orig), safe(currentLang?.mv?.orig)),
            dub: mergeCounts(safe(totalLang?.mv?.dub), safe(currentLang?.mv?.dub)),
            sub: mergeCounts(safe(totalLang?.mv?.sub), safe(currentLang?.mv?.sub)),
        },
        gm: {
            sub: mergeCounts(safe(totalLang?.gm?.sub), safe(currentLang?.gm?.sub)),
            voice: mergeCounts(safe(totalLang?.gm?.voice), safe(currentLang?.gm?.voice)),
            ui: mergeCounts(safe(totalLang?.gm?.ui), safe(currentLang?.gm?.ui)),
        },
        };
    }

    const handleWorkClick = (work) => {
        window.location.hash = `#/work/${work.id}`;
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
      if (view === "detail") window.location.hash = "#/list";
      else window.location.hash = "";
    };

  // 類型數量
  const genreCountMap = useMemo(() => {
      const map = new Map();
      works.forEach((w) => {
        if (!w.genre_tags) return;
        String(w.genre_tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((tag) => map.set(tag, (map.get(tag) || 0) + 1));
      });
      return map;
    }, [works]);

  // Loading
  if (loading && !works.length && view !== "home") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6">
        <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-4" />
        <p className="text-white text-lg">資料載入中...</p>
      </div>
    );
  }

  // Home
  if (view === "home" && !selectedWorkId) {
      return (
        <div className="min-h-screen relative overflow-hidden bg-slate-900">

          {/*背景圖*/}
          <div
            className="
              absolute inset-0
              bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80')]
              bg-cover bg-center
              opacity-10 blur-sm
              z-0
            "
          />

          {/*前景內容*/}
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-8 max-w-lg">

              <div className="w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-sky-500/50">
                <Layers size={40} className="text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                台灣作品資料庫
                <span className="block text-2xl font-bold tracking-tight text-slate-300 italic">
                  Taiwan MSG Project
                </span>
                <span className="block text-sky-500 text-base tracking-wide font-normal">
                  Movies • Series • Games
                </span>
                <div className="h-1 w-47 bg-sky-500 mx-auto rounded-full"></div>
              </h1>

              <p className="text-slate-400">
                與台灣相關的電影、影集與電子遊戲作品彙整。
              </p>

              <button
                onClick={() => {
                  window.location.hash = "#/list";
                }}
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

  // Detail
  if (view === "detail" && selectedWork) {
    const w = selectedWork;
    const isMovie = w.work_type_key === "movies";
    const isSeries = w.work_type_key === "series";
    const isGame = w.work_type_key === "games";

    return (
      <div className="min-h-screen bg-slate-950 pb-20">
        <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center gap-4 shadow-md">
          <button onClick={handleBack} className="p-1 rounded-full hover:bg-slate-800 text-white transition-colors">
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-bold text-white truncate">詳細資訊</h2>
        </div>

        <div className="relative h-48 w-full overflow-hidden">
          {w.main_image_url ? (
            <img src={w.main_image_url} className="w-full h-full object-cover blur-sm opacity-50 scale-110" />
          ) : (
            <div className="w-full h-full bg-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        <div className="px-5 -mt-20 relative z-10">
          <div className="flex gap-4 items-end">
            <div
              className={`w-32 aspect-[2/3] bg-slate-800 rounded-lg shadow-2xl border-2 border-slate-700 overflow-hidden flex-shrink-0 relative group
              ${w.main_image_url ? "cursor-pointer hover:border-sky-500 transition-colors" : ""}`}
              onClick={() => w.main_image_url && handleOpenModal(0)}
            >
              {w.main_image_url ? (
                <>
                  <img src={w.main_image_url} className="w-full h-full object-cover" />
                  {fullImageList.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn size={32} className="text-white" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-white">{w.title_zh}</h1>
                {isMovie && w.title_original && w.title_original !== w.title_zh && (
                  <p className="text-slate-300 text-sm font-medium">原文: {w.title_original}</p>
                )}
                <p className="text-slate-400 text-sm font-medium">{w.title_en}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`shrink-0 px-2 py-1 text-xs rounded border ${getTypeClass(w)}`}>
                {w.work_type || "未知"}
              </span>

              <span className={`px-2 py-1 text-xs rounded border ${getStatusClass(w.status)}`}>
                {w.status || "未知"}
              </span>

              {w.runtime && (
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 flex items-center">
                  <Clock size={10} className="mr-1" />
                  {w.runtime}
                  {isGame ? "" : " 分"}
                </span>
              )}

              {isSeries && w.episode_total_count && (
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                  共 {w.episode_total_count} 集
                </span>
              )}
            </div>

            {fullImageList.length > 1 && (
              <button
                onClick={() => handleOpenModal(1)}
                className="mt-4 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center transition-colors border border-slate-700"
              >
                <ImageIcon size={16} className="mr-2" />
                查看 {fullImageList.length} 張圖片
              </button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 text-sm">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
              <InfoRow label="製作國家" value={formatCountriesSorted(w.countries)} />
              {isMovie && <InfoRow label="導演" value={w.director} />}
              {isSeries && <InfoRow label="導演" value={w.director} />}
              {isGame && <InfoRow label="開發商" value={w.developer} />}
              {isGame && <InfoRow label="發行商" value={w.publisher} />}
              {isGame && <InfoRow label="平台" value={w.platforms} />}
              <InfoRow label="主要演員" value={w.main_cast} />
              <InfoRow label="類型" value={formatGenreTagsSorted(w.genre_tags)} />
              <InfoRow label={isSeries ? "首播詳情" : "發布詳情"} value={w.release_date_detailed || w.release_date} />
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">語言支援</h3>
              <p className="text-slate-300">{w.supported_languages || "無資料"}</p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h3 className="text-slate-500 text-xs font-bold uppercase mb-2 flex items-center">
                <FileText size={14} className="mr-1" /> 中文簡介
              </h3>
              <SimpleMarkdown text={w.description_zh} />
            </div>

            {w.description_en && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2 flex items-center">
                  <FileText size={14} className="mr-1" /> English Description
                </h3>
                <SimpleMarkdown text={w.description_en} />
              </div>
            )}

            {w.related_links && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">相關連結</h3>
                <LinkParser linksString={w.related_links} />
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-slate-600 text-xs pb-4">
            ID: {w.id} • Last Updated: {w.last_update}
          </div>
        </div>

        {isModalOpen && fullImageList.length > 0 &&
          createPortal(
            <ImageCarouselModal
              images={fullImageList}
              currentIndex={modalImageIndex}
              onNext={handleNextImage}
              onPrev={handlePrevImage}
              onClose={handleCloseModal}
            />,
            document.body
          )}
      </div>
    );
  }

  // List
  return (
    <div className="min-h-screen bg-slate-950 pb-10">
      <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <button onClick={handleBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
          <Home />
        </button>
        <h2 className="text-lg font-bold text-white">作品列表 ({sortedWorks.length})</h2>
        <button
          onClick={() => setDisplayMode((m) => (m === "grid" ? "list" : "grid"))}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title={displayMode === "grid" ? "切換為條列" : "切換為方塊"}
        >
          {displayMode === "grid" ? <List size={18} /> : <LayoutGrid size={18} />}
        </button>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="text-xs text-red-300/90 bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        </div>
      )}

      <div className="sticky top-[56px] z-20 bg-slate-950/80 backdrop-blur-md">
          <div className="px-4 py-3">
            <div className="mx-auto max-w-6xl flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="以+-篩選或排除關鍵字，進階搜尋方法請見首頁更多資訊"
                  className="
                    w-full h-10
                    bg-slate-900/60
                    border border-slate-800
                    rounded-xl
                    pl-10 pr-3
                    text-sm text-slate-100
                    placeholder:text-slate-500
                    outline-none
                    focus:border-sky-500/60
                    focus:ring-2 focus:ring-sky-500/10
                    transition
                  "
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setAppliedSearch(searchInput);
                    }
                  }}
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>

              <button
                className="
                  h-10 px-4
                  rounded-xl
                  bg-sky-600 hover:bg-sky-500
                  text-white text-sm font-semibold
                  transition
                  shadow-sm
                  inline-flex items-center gap-2
                "
                type="button"
                onClick={() => setAppliedSearch(searchInput)}
              >
                <Search size={16} />
                搜尋
              </button>

              <button
                className="
                  h-10 px-4
                  rounded-xl
                  bg-slate-900/60 hover:bg-slate-800/70
                  border border-slate-800
                  text-slate-100 text-sm font-semibold
                  transition
                  inline-flex items-center gap-2
                "
                type="button"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal size={16} />
                進階
              </button>

              <div className="relative" ref={sortMenuRef}>
                  <button
                    className="
                      h-10 px-4
                      rounded-xl
                      bg-slate-900/60 hover:bg-slate-800/70
                      border border-slate-800
                      text-slate-100 text-sm font-semibold
                      transition
                      inline-flex items-center gap-2
                    "
                    type="button"
                    onClick={() => setSortMenuOpen((v) => !v)}
                  >
                    <ArrowUpDown size={16} />
                    排序
                    <ChevronDown size={16} className="opacity-70" />
                  </button>
                    {sortMenuOpen && (
                    <div
                        className="
                        absolute right-0 mt-2 w-[280px]
                        rounded-xl border border-slate-800
                        bg-slate-950/95 backdrop-blur
                        shadow-xl
                        overflow-hidden
                        z-50
                        "
                    >
                        <div className="p-3 border-b border-slate-800">
                        <div className="text-xs text-slate-400 mb-2">排序欄位</div>
                        <div className="grid grid-cols-1 gap-1">
                            {[
                            ["release_date_simp", "發布日期"],
                            ["id", "編號"],
                            ["name", "名稱"],
                            ["episode_total_count", "總集數（隱藏電影和遊戲）"],
                            ["runtime", "片長（隱藏遊戲）"],
                            ["last_update", "上次更新時間"],
                            ].map(([k, label]) => (
                            <button
                                key={k}
                                type="button"
                                onClick={() => setSortKey(k)}
                                className={`
                                w-full text-left px-3 py-2 rounded-lg text-sm
                                hover:bg-slate-800/60 transition
                                ${sortKey === k ? "bg-slate-800/70 text-white" : "text-slate-200"}
                                `}
                            >
                                {label}
                            </button>
                            ))}
                        </div>
                        </div>

                        <div className="p-3">
                        <div className="text-xs text-slate-400 mb-2">遞增 / 遞減</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                            type="button"
                            onClick={() => setSortDir("asc")}
                            className={`
                                px-3 py-2 rounded-lg text-sm font-semibold
                                border border-slate-800 hover:bg-slate-800/60 transition
                                ${sortDir === "asc" ? "bg-sky-600/20 border-sky-500/40 text-sky-200" : "text-slate-200"}
                            `}
                            >
                            遞增
                            </button>
                            <button
                            type="button"
                            onClick={() => setSortDir("desc")}
                            className={`
                                px-3 py-2 rounded-lg text-sm font-semibold
                                border border-slate-800 hover:bg-slate-800/60 transition
                                ${sortDir === "desc" ? "bg-sky-600/20 border-sky-500/40 text-sky-200" : "text-slate-200"}
                            `}
                            >
                            遞減
                            </button>
                        </div>

                        <div className="mt-3 flex justify-end">
                            <button
                            type="button"
                            onClick={() => setSortMenuOpen(false)}
                            className="text-xs text-slate-400 hover:text-slate-200 transition"
                            >
                            關閉
                            </button> 
                        </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>
          </div>
        </div>

      <div className="p-4 mx-auto max-w-6xl">
          <div
            className={
              displayMode === "grid"
                ? "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]"
                : "flex flex-col gap-3"
            }
          >
            {sortedWorks.map((work) => (
              displayMode === "grid" ? (
                  <div
                    key={work.id}
                    onClick={() => handleWorkClick(work)}
                    className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group shadow-lg flex flex-col h-full"
                    onMouseEnter={() => setHoveredWorkId(work.id)}
                    onMouseLeave={() => setHoveredWorkId(null)}
                  >
                    <div className="relative w-full aspect-[1/1] bg-slate-800 overflow-hidden">
                      {work.main_image_url ? (
                        <img
                          src={work.main_image_url}
                          alt={work.title_zh}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : null}

                      {!work.main_image_url && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-600">
                          <ImageIcon size={32} className="mb-2 opacity-50" />
                          <span className="text-xs">No Image</span>
                        </div>
                      )}

                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 backdrop-blur text-xs rounded border ${getStatusClass(work.status)}`}>
                          {work.status}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 backdrop-blur text-xs rounded border ${getTypeClass(work)}`}>
                          {work.work_type}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="font-bold text-white text-sm line-clamp-2 mb-1">
                        {work.title_zh || "未知"}
                        {work.work_type_key === "movies" &&
                          work.title_original &&
                          work.title_original !== work.title_zh && (
                            <span className="ml-1 text-slate-400 text-xs font-normal">
                              ({work.title_original})
                            </span>
                          )}
                      </h3>

                      <div className="mt-auto space-y-1">
                        <div className="flex items-center text-xs text-sky-400">
                          <Calendar size={12} className="mr-1" />
                          {formatChineseDate(work.release_date_simp)}
                        </div>

                        <div className="flex items-center text-xs text-slate-400">
                          <Globe size={12} className="mr-1" />
                          <span className="truncate">{splitToZhList(formatCountriesSorted(work.countries))}</span>
                        </div>

                        <HoverScrollTags
                            tags={getSortedGenreTagsByFrequency(work.genre_tags, genreCountMap)}
                            active={hoveredWorkId === work.id}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                  key={work.id}
                  onClick={() => handleWorkClick(work)}
                  className="relative bg-slate-900/60 rounded-xl border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer flex items-stretch gap-4 p-3"
                >
                  <div className="group relative shrink-0">
                      {work.main_image_url ? (
                        <>
                          <div className="w-12 aspect-[2/3] bg-slate-800 rounded-lg overflow-hidden">
                            <img
                              src={work.main_image_url}
                              alt={work.title_zh}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          <div
                            className="
                              w-[260px]
                              max-h-[60vh]
                              pointer-events-none
                              absolute right-0 top-1/2 -translate-y-1/2
                              opacity-0 scale-95
                              group-hover:opacity-100 group-hover:scale-100
                              transition-all duration-300
                              z-50
                            "
                          >
                            <img
                              src={work.main_image_url}
                              alt={`${work.title_zh} preview`}
                              className="
                                w-full
                                h-auto
                                object-contain
                                shadow-2xl
                                bg-black
                              "
                            />
                          </div>
                        </>
                      ) : (
                        <div className="w-12 aspect-[2/3] bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                  <div className="shrink-0 flex flex-col justify-start gap-2 pt-1">
                    <span className={`px-2 py-1 backdrop-blur text-xs rounded border ${getStatusClass(work.status)}`}>
                      {work.status}
                    </span>
                    <span className={`px-2 py-1 backdrop-blur text-xs rounded border ${getTypeClass(work)}`}>
                      {work.work_type}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base truncate">{work.title_zh}</h3>
                      <p className="text-slate-400 text-xs truncate">{work.title_original || '\u00A0'}</p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="inline-flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {formatChineseDate(work.release_date_simp)}
                      </span>
                      {work.countries && (
                        <span className="truncate">國家/地區：{splitToZhList(formatCountriesSorted(work.countries))}</span>
                      )}
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-col justify-start gap-2 w-[220px] shrink-0">
                    <div className="text-xs text-slate-400 truncate">
                    {work.runtime 
                        ? <span>
                            <span className="text-slate-200">片長</span><span className="mx-1">{work.runtime}</span>分鐘
                        </span>
                      : "\u00A0"}
                    </div>

                    <div className="text-xs text-slate-400 leading-snug truncate">
                        {work.director
                        ? <span>
                            <span className="text-slate-200">導演</span><span className="mx-1">{splitToZhList(work.director)}</span>
                        </span>
                        : work.developer
                        ? <span>
                            <span className="text-slate-200">開發商</span><span className="mx-1">{splitToZhList(work.developer)}</span>
                        </span>
                        : "\u00A0"}
                    </div>

                    <div className="text-xs text-slate-400 leading-snug truncate">
                        {work.main_cast
                        ? <span>
                            <span className="text-slate-200">主演</span><span className="mx-1">{splitToZhList(formatActorList(work.main_cast))}</span>
                        </span>
                        : work.publisher
                        ? <span>
                            <span className="text-slate-200">發行商</span><span className="mx-1">{splitToZhList(work.publisher)}</span>
                        </span>
                        : "\u00A0"}
                    </div>
                </div>

                  <div className="hidden md:flex w-[30%] lg:w-[40%] min-w-0 items-start">
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                      {work.description_zh ? <SimpleMarkdownList text={work.description_zh} /> : ""}
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 px-4 py-0 shadow-md">
            <div className="mx-auto max-w-3xl overflow-hidden">
                <p className="hidden md:block text-xs text-slate-400 truncate pb-1 pt-1">僅收錄台灣製作、台灣取景或/和設定在台灣的影視作品。電影僅包含40分鐘以上長片。遊戲僅包含台灣製作的電子遊戲，且不包括大型電玩。</p>
                <div className="md:hidden marquee-wrap">
                  <div className="marquee-track pb-1 pt-1">
                    <span className="marquee-item text-xs text-slate-400">
                      僅收錄台灣製作、台灣取景或/和設定在台灣的影視作品。電影僅包含40分鐘以上長片。遊戲僅包含台灣製作的電子遊戲，且不包括大型電玩。
                    </span>
                    <span className="marquee-item text-xs text-slate-400">
                      僅收錄台灣製作、台灣取景或/和設定在台灣的影視作品。電影僅包含40分鐘以上長片。遊戲僅包含台灣製作的電子遊戲，且不包括大型電玩。
                    </span>
                  </div>
                </div>
            </div>
        </div>
        {filterOpen && createPortal(
              <FilterModal
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                statusCounts={statusCountsUI}
                countryCounts={countryCountsUI}
                genreCounts={genreCountsUI}
                langCounts={langCountsUI}
                tempFilters={tempFilters}
                setTempFilters={setTempFilters}
                dateFormatWarning={dateFormatWarning}
                onResetAll={resetAllFiltersUI}
                onApply={onApply}
                onConfirm={onConfirm}
              />,
              document.body
            )}
    </div>
  );
}