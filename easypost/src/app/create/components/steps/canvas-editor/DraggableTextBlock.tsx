'use client';

import { TextBlockProps } from './types';
import { CANVAS_W } from './constants';

export function DraggableTextBlock({ block, isSelected, canvasH, onSelect, onDragStart }: TextBlockProps) {
    const left = (block.xPercent / 100) * CANVAS_W;
    const top = (block.yPercent / 100) * canvasH;
    const isPrimary = block.id === 'title' || block.id === 'body';

    // Width based on role: title/body get 80%, others 60%
    const widthPercent = isPrimary ? 80 : 60;
    const width = (widthPercent / 100) * CANVAS_W;

    return (
        <div
            onClick={(e) => { e.stopPropagation(); }}
            onMouseDown={(e) => { e.stopPropagation(); onSelect(); onDragStart(block.id, e.clientX, e.clientY); }}
            onTouchStart={(e) => { e.stopPropagation(); onSelect(); onDragStart(block.id, e.touches[0].clientX, e.touches[0].clientY); }}
            style={{
                position: 'absolute',
                left,
                top,
                width,
                fontSize: block.fontSize,
                color: block.color,
                fontFamily: `'${block.fontFamily}', sans-serif`,
                fontWeight: block.bold ? 'bold' : 'normal',
                fontStyle: block.italic ? 'italic' : 'normal',
                textAlign: block.textAlign ?? 'center',
                cursor: 'move',
                userSelect: 'none',
                padding: isPrimary ? '16px' : '12px',
                border: isSelected
                    ? '2px dashed rgba(127,13,242,0.8)'
                    : '1px dashed transparent',
                borderRadius: 4,
                background: isSelected ? 'rgba(127,13,242,0.08)' : 'transparent',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.1,
                boxSizing: 'border-box',
            }}
        >
            {/* Drag indicator */}
            {isSelected && (
                <div
                    style={{
                        position: 'absolute',
                        top: -20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        cursor: 'grab',
                        color: 'rgba(127,13,242,0.8)',
                        fontSize: 18,
                        lineHeight: 1,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="8" cy="6" r="2" /><circle cx="16" cy="6" r="2" />
                        <circle cx="8" cy="12" r="2" /><circle cx="16" cy="12" r="2" />
                        <circle cx="8" cy="18" r="2" /><circle cx="16" cy="18" r="2" />
                    </svg>
                </div>
            )}
            {block.text}
            {/* Resize handles */}
            {isSelected && (
                <>
                    <span className="absolute -top-1.5 -left-1.5 size-2.5 bg-white border border-[#7f0df2] rounded-sm" />
                    <span className="absolute -top-1.5 -right-1.5 size-2.5 bg-white border border-[#7f0df2] rounded-sm" />
                    <span className="absolute -bottom-1.5 -left-1.5 size-2.5 bg-white border border-[#7f0df2] rounded-sm" />
                    <span className="absolute -bottom-1.5 -right-1.5 size-2.5 bg-white border border-[#7f0df2] rounded-sm" />
                </>
            )}
        </div>
    );
}
