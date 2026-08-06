// src/hooks/useImageGallery.js

import {
    useCallback,
    useMemo,
    useState,
} from "react";

import { parseCommaList } from "../utils/strings";

export function useImageGallery(work) {
    const [isOpen, setIsOpen] =
        useState(false);

    const [currentIndex, setCurrentIndex] =
        useState(0);

    const images = useMemo(() => {
        if (!work) {
            return [];
        }

        const result = [];

        if (work.main_image_url) {
            result.push(work.main_image_url);
        }

        const otherImages = parseCommaList(
            work.other_image_urls
        );

        for (const imageUrl of otherImages) {
            if (!result.includes(imageUrl)) {
                result.push(imageUrl);
            }
        }

        return result;
    }, [work]);

    const open = useCallback(
        (index = 0) => {
            if (!images.length) {
                return;
            }

            const safeIndex = Math.min(
                Math.max(index, 0),
                images.length - 1
            );

            setCurrentIndex(safeIndex);
            setIsOpen(true);
        },
        [images.length]
    );

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const next = useCallback(() => {
        setCurrentIndex((index) => {
            if (!images.length) {
                return 0;
            }

            return (index + 1) % images.length;
        });
    }, [images.length]);

    const previous = useCallback(() => {
        setCurrentIndex((index) => {
            if (!images.length) {
                return 0;
            }

            return (
                index - 1 + images.length
            ) % images.length;
        });
    }, [images.length]);

    return {
        images,
        isOpen,
        currentIndex,
        open,
        close,
        next,
        previous,
    };
}