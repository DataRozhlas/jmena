import { useCallback, useEffect, useRef } from "react";

const debounce = (func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const usePostMessageWithHeight = (id: string) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const postHeightMessage = useCallback(() => {
        if (containerRef.current) {
            const { height } = containerRef.current.getBoundingClientRect();
            if (window.parent) {
                window.parent.postMessage(
                    {
                        "cro-embed-height": {
                            [id]: height,
                        },
                    },
                    "*",
                );
            }
        }
    }, [id]);

    const onResize = useCallback(
        debounce(() => {
            postHeightMessage();
            setTimeout(() => postHeightMessage(), 300);
            setTimeout(() => postHeightMessage(), 1000);
            setTimeout(() => postHeightMessage(), 5000);
            setTimeout(() => postHeightMessage(), 7500);
            setTimeout(() => postHeightMessage(), 15000);
        }, 50),
        [postHeightMessage],
    );

    useEffect(() => {
        onResize();

        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, [onResize]);

    return {
        containerRef,
        postHeightMessage,
    };
};
