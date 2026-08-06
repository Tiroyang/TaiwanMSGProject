// src/components/detail/ImageCarouselModal.jsx

import { useEffect } from "react";
import { createPortal } from "react-dom";

import {
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

export default function ImageCarouselModal({
    open,
    images,
    currentIndex,
    onNext,
    onPrevious,
    onClose,
}) {
    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event) {
            if (event.key === "ArrowRight") {
                onNext();
            }

            if (event.key === "ArrowLeft") {
                onPrevious();
            }

            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.body.style.overflow =
                previousOverflow;
        };
    }, [
        open,
        onNext,
        onPrevious,
        onClose,
    ]);

    if (!open || !images.length) {
        return null;
    }

    const currentImage =
        images[currentIndex];

    const hasMultiple =
        images.length > 1;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="關閉圖片"
            >
                <X size={24} />
            </button>

            <div
                className="relative flex h-full max-h-[90vh] w-full max-w-7xl items-center justify-center"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <img
                    src={currentImage}
                    alt={`作品圖片 ${currentIndex + 1}`}
                    className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                />

                {hasMultiple && (
                    <>
                        <button
                            type="button"
                            onClick={onPrevious}
                            className="absolute left-4 hidden rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:block"
                            aria-label="上一張圖片"
                        >
                            <ChevronLeft size={32} />
                        </button>

                        <button
                            type="button"
                            onClick={onNext}
                            className="absolute right-4 hidden rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:block"
                            aria-label="下一張圖片"
                        >
                            <ChevronRight size={32} />
                        </button>

                        <div className="absolute bottom-4 rounded bg-black/50 px-4 py-2 text-sm text-white">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}