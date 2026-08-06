// src/components/works/HoverScrollTags.jsx

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { getTagView } from "../../utils/tags";

export default function HoverScrollTags({
    tags = [],
    active = false,
    tagMap,
    lang = "zh",
}) {
    const wrapRef = useRef(null);
    const trackRef = useRef(null);
    const animationRef = useRef(null);
    const frameRef = useRef(0);

    const [overflowX, setOverflowX] =
        useState(0);

    useLayoutEffect(() => {
        const wrap = wrapRef.current;
        const track = trackRef.current;

        if (!wrap || !track) {
            return;
        }

        function measure() {
            const distance = Math.max(
                0,
                track.scrollWidth - wrap.clientWidth
            );

            setOverflowX(distance);
        }

        measure();

        window.addEventListener(
            "resize",
            measure
        );

        return () => {
            window.removeEventListener(
                "resize",
                measure
            );
        };
    }, [tags, tagMap, lang]);

    useEffect(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        function stopAnimation() {
            animationRef.current?.cancel?.();
            animationRef.current = null;

            track.style.transform =
                "translateX(0px)";
        }

        if (!active || overflowX <= 0) {
            stopAnimation();
            return;
        }

        cancelAnimationFrame(frameRef.current);

        frameRef.current =
            requestAnimationFrame(() => {
                stopAnimation();

                const millisecondsPerPixel = 18;
                const travel = overflowX;

                const travelDuration = Math.max(
                    800,
                    travel * millisecondsPerPixel
                );

                const pauseDuration = 900;

                const totalDuration =
                    travelDuration * 2 +
                    pauseDuration * 2;

                animationRef.current =
                    track.animate(
                        [
                            {
                                transform: "translateX(0px)",
                                offset: 0,
                            },
                            {
                                transform: "translateX(0px)",
                                offset:
                                    pauseDuration /
                                    totalDuration,
                            },
                            {
                                transform:
                                    `translateX(-${travel}px)`,
                                offset:
                                    (pauseDuration +
                                        travelDuration) /
                                    totalDuration,
                            },
                            {
                                transform:
                                    `translateX(-${travel}px)`,
                                offset:
                                    (pauseDuration +
                                        travelDuration +
                                        pauseDuration) /
                                    totalDuration,
                            },
                            {
                                transform: "translateX(0px)",
                                offset: 1,
                            },
                        ],
                        {
                            duration: totalDuration,
                            iterations: Infinity,
                            easing: "linear",
                        }
                    );
            });

        return () => {
            cancelAnimationFrame(
                frameRef.current
            );

            animationRef.current?.cancel?.();
            animationRef.current = null;
        };
    }, [active, overflowX]);

    if (!tags.length) {
        return null;
    }

    return (
        <div
            ref={wrapRef}
            className="flex gap-1 mt-2 overflow-hidden whitespace-nowrap"
        >
            <div
                ref={trackRef}
                className="inline-flex gap-1 will-change-transform"
            >
                {tags.map((tag, index) => {
                    const view = getTagView(
                        tag,
                        tagMap,
                        lang
                    );

                    return (
                        <span
                            key={`${tag}-${index}`}
                            className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700"
                        >
                            {view.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}