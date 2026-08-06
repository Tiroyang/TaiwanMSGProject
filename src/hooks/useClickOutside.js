// src/hooks/useClickOutside.js

import { useEffect } from "react";

export function useClickOutside(
    ref,
    enabled,
    onOutside
) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        function handleMouseDown(event) {
            const element = ref.current;

            if (
                element &&
                !element.contains(event.target)
            ) {
                onOutside();
            }
        }

        document.addEventListener(
            "mousedown",
            handleMouseDown
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleMouseDown
            );
        };
    }, [
        ref,
        enabled,
        onOutside,
    ]);
}