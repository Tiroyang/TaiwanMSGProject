// src/components/detail/OtherTitlesPopover.jsx

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import {
    createPortal,
} from "react-dom";

import {
    Info,
    X,
} from "lucide-react";

import {
    formatZhList,
    parseOtherTitleGroups,
} from "../../utils/strings";


const POPOVER_WIDTH = 360;
const VIEWPORT_PADDING = 16;
const GAP = 8;


export default function OtherTitlesPopover({
    value,
}) {
    const [
        open,
        setOpen,
    ] = useState(false);

    const [
        position,
        setPosition,
    ] = useState({
        top: 0,
        left: 0,
    });

    const buttonRef = useRef(null);
    const popoverRef = useRef(null);
    const timeoutRef = useRef(null);

    const groups = parseOtherTitleGroups(value);

    const clearHoverTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleMouseEnter = () => {
        clearHoverTimeout();
        setOpen(true);
    };

    const handleMouseLeave = () => {
        clearHoverTimeout();
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 150);
    };

    function updatePosition() {
        const button = buttonRef.current;
        const popover = popoverRef.current;

        if (!button || !popover) {
            return;
        }

        const buttonRect = button.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const spaceRight = viewportWidth - buttonRect.right;
        const spaceLeft = buttonRect.left;

        let left;

        // 如果右側空間足夠放置 Popover，或者右邊空間比左邊大，放右側
        if (
            spaceRight >= popoverRect.width + GAP ||
            spaceRight >= spaceLeft
        ) {
            left = buttonRect.right + GAP; // 按鈕右緣 + 間距
        } else {
            left = buttonRect.left - popoverRect.width - GAP; // 改放左側
        }

        /* 
           垂直位置（預設與按鈕垂直置中對齊）
         */
        let top = buttonRect.top + buttonRect.height / 2 - popoverRect.height / 2;

        /* 
           限制不超出 Viewport 邊界
         */
        left = Math.max(
            VIEWPORT_PADDING,
            Math.min(
                left,
                viewportWidth - popoverRect.width - VIEWPORT_PADDING
            )
        );

        top = Math.max(
            VIEWPORT_PADDING,
            Math.min(
                top,
                viewportHeight - popoverRect.height - VIEWPORT_PADDING
            )
        );

        setPosition({
            top,
            left,
        });
    }

    useLayoutEffect(() => {
        if (!open) {
            return;
        }

        updatePosition();
    }, [open, value]);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleMouseDown(event) {
            const button = buttonRef.current;
            const popover = popoverRef.current;

            if (button?.contains(event.target) || popover?.contains(event.target)) {
                return;
            }

            setOpen(false);
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        function handleViewportChange() {
            updatePosition();
        }

        document.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("resize", handleViewportChange);
        window.addEventListener("scroll", handleViewportChange, true);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleViewportChange);
            window.removeEventListener("scroll", handleViewportChange, true);
        };
    }, [open]);

    useEffect(() => {
        return () => {
            clearHoverTimeout();
        };
    }, []);

    if (!String(value || "").trim() || groups.length === 0) {
        return null;
    }

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => {
                    clearHoverTimeout();
                    setOpen((current) => !current);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="
                    inline-flex
                    h-7 w-7
                    shrink-0
                    items-center justify-center
                    rounded-full
                    text-slate-400
                    transition
                    hover:bg-slate-800/80
                    hover:text-sky-300
                "
                title="其他作品名稱"
                aria-label="查看其他作品名稱"
                aria-expanded={open}
            >
                <Info size={17} />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={popoverRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className="
                            fixed
                            z-[120]
                            overflow-hidden
                            rounded-xl
                            border border-slate-700
                            bg-slate-950/95
                            shadow-2xl
                            backdrop-blur-md
                        "
                        style={{
                            top: position.top,
                            left: position.left,
                            width: `min(${POPOVER_WIDTH}px, calc(100vw - ${
                                VIEWPORT_PADDING * 2
                            }px))`,
                            maxHeight: "min(60vh, 520px)",
                        }}
                    >
                        <header
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-slate-800
                                px-4 py-3
                            "
                        >
                            <div className="text-sm font-bold text-white">
                                其他作品名稱
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    clearHoverTimeout();
                                    setOpen(false);
                                }}
                                className="
                                    text-slate-400
                                    transition
                                    hover:text-white
                                "
                                aria-label="關閉"
                            >
                                <X size={16} />
                            </button>
                        </header>

                        <div
                            className="
                                max-h-[calc(min(60vh,520px)-49px)]
                                space-y-3
                                overflow-y-auto
                                p-4
                            "
                        >
                            {groups.map((group, index) => (
                                <OtherTitleRow
                                    key={`${group.place}-${index}`}
                                    place={group.place}
                                    titles={group.titles}
                                />
                            ))}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

function OtherTitleRow({ place, titles }) {
    return (
        <div
            className="
                grid
                grid-cols-[72px_1fr]
                gap-3
                text-sm
            "
        >
            <div className="text-slate-500">{place || ""}</div>

            <div
                className="
                    break-words
                    leading-6
                    text-slate-200
                "
            >
                {formatZhList(titles)}
            </div>
        </div>
    );
}