import { useScroll, useTransform } from 'framer-motion';
import { RefObject } from 'react';

type EdgeTuple = 'start start' | 'start end' | 'end start' | 'end end';

export function useParallax(
    ref: RefObject<HTMLElement | null>,
    distance: [number, number],
    offset: [EdgeTuple, EdgeTuple] = ['start end', 'end start']
) {
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: offset
    });

    return useTransform(scrollYProgress, [0, 1], distance);
}
