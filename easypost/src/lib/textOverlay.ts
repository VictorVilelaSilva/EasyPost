import sharp from 'sharp';
import { SlideData, Platform } from '../types';

interface TextZone {
    x: number;
    y: number;
    maxWidth: number;
    fontSize: number;
    lineHeight: number;
    color: string;
    fontWeight: string;
    textTransform?: 'uppercase' | 'none';
}

interface BadgeZone {
    x: number;
    y: number;
    width: number;
    height: number;
    bgColor: string;
    radius: number;
}

interface SlideLayout {
    badge?: BadgeZone;
    title?: TextZone;
    subtitle?: TextZone;
    body?: TextZone;
    actions?: { x: number; y: number; fontSize: number; color: string; spacing: number };
}

interface PlatformLayout {
    width: number;
    height: number;
    cover: SlideLayout;
    content: SlideLayout;
    cta: SlideLayout;
}

const LAYOUT_PRESETS: Record<Platform, PlatformLayout> = {
    instagram: {
        width: 1080,
        height: 1350,
        cover: {
            badge: { x: 80, y: 520, width: 920, height: 130, bgColor: '#1a2744', radius: 16 },
            title: { x: 120, y: 545, maxWidth: 840, fontSize: 52, lineHeight: 1.3, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase' },
            subtitle: { x: 80, y: 690, maxWidth: 920, fontSize: 36, lineHeight: 1.3, color: '#1a2744', fontWeight: 'normal', textTransform: 'uppercase' },
        },
        content: {
            body: { x: 100, y: 300, maxWidth: 880, fontSize: 44, lineHeight: 1.55, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase' },
        },
        cta: {
            badge: { x: 80, y: 420, width: 920, height: 130, bgColor: '#1a2744', radius: 16 },
            title: { x: 120, y: 445, maxWidth: 840, fontSize: 48, lineHeight: 1.3, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase' },
            actions: { x: 120, y: 620, fontSize: 36, color: '#1a2744', spacing: 80 },
        },
    },
    linkedin: {
        width: 1080,
        height: 1080,
        cover: {
            badge: { x: 80, y: 400, width: 920, height: 130, bgColor: '#1a2744', radius: 16 },
            title: { x: 120, y: 425, maxWidth: 840, fontSize: 48, lineHeight: 1.3, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase' },
            subtitle: { x: 80, y: 570, maxWidth: 920, fontSize: 32, lineHeight: 1.3, color: '#1a2744', fontWeight: 'normal', textTransform: 'uppercase' },
        },
        content: {
            body: { x: 100, y: 220, maxWidth: 880, fontSize: 40, lineHeight: 1.55, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase' },
        },
        cta: {
            badge: { x: 80, y: 340, width: 920, height: 130, bgColor: '#1a2744', radius: 16 },
            title: { x: 120, y: 365, maxWidth: 840, fontSize: 44, lineHeight: 1.3, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase' },
            actions: { x: 120, y: 530, fontSize: 32, color: '#1a2744', spacing: 70 },
        },
    },
};

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function wrapText(text: string, fontSize: number, maxWidth: number): string[] {
    const avgCharWidth = fontSize * 0.52;
    const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length > maxCharsPerLine && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

function buildTextElement(zone: TextZone, text: string, fontFamily: string): string {
    const displayText = zone.textTransform === 'uppercase' ? text.toUpperCase() : text;
    const lines = wrapText(displayText, zone.fontSize, zone.maxWidth);
    const lineHeightPx = zone.fontSize * zone.lineHeight;

    return lines.map((line, i) => {
        const y = zone.y + i * lineHeightPx;
        return `<text x="${zone.x}" y="${y}" font-family="${fontFamily}, serif" font-size="${zone.fontSize}" font-weight="${zone.fontWeight}" fill="${zone.color}">${escapeXml(line)}</text>`;
    }).join('\n    ');
}

function buildBadgeElement(badge: BadgeZone, titleLines: number, titleFontSize: number, titleLineHeight: number): string {
    const textHeight = titleLines * titleFontSize * titleLineHeight;
    const dynamicHeight = Math.max(badge.height, textHeight + 40);
    return `<rect x="${badge.x}" y="${badge.y}" width="${badge.width}" height="${dynamicHeight}" rx="${badge.radius}" ry="${badge.radius}" fill="${badge.bgColor}" />`;
}

function buildCTAActions(actions: { x: number; y: number; fontSize: number; color: string; spacing: number }, fontFamily: string): string {
    const items = [
        { icon: '\u2764\uFE0F', label: 'CURTA' },
        { icon: '\uD83D\uDCAC', label: 'COMENTE' },
        { icon: '\u2708\uFE0F', label: 'COMPARTILHE' },
    ];

    return items.map((item, i) => {
        const y = actions.y + i * actions.spacing;
        return `<text x="${actions.x}" y="${y}" font-family="${fontFamily}, serif" font-size="${actions.fontSize}" font-weight="bold" fill="${actions.color}">${item.icon}  ${item.label}</text>`;
    }).join('\n    ');
}

export function buildTextSVG(
    slide: SlideData,
    platform: Platform,
    fontFamily: string,
    styleOverrides?: { badgeColor?: string; textColor?: string; accent?: string }
): Buffer {
    const layout = LAYOUT_PRESETS[platform];
    const { width, height } = layout;
    const slideLayout = layout[slide.slideType];

    // Override default colors when custom style values are provided.
    if (styleOverrides) {
        if (slideLayout.badge && styleOverrides.badgeColor) {
            slideLayout.badge.bgColor = styleOverrides.badgeColor;
        }
        if (slideLayout.title && styleOverrides.textColor) {
            // Title color stays white on badges; subtitle/actions can inherit custom accent colors.
        }
        if (slideLayout.subtitle && styleOverrides.badgeColor) {
            slideLayout.subtitle.color = styleOverrides.badgeColor;
        }
        if (slideLayout.actions && styleOverrides.badgeColor) {
            slideLayout.actions.color = styleOverrides.badgeColor;
        }
    }

    let svgContent = '';

    if (slide.slideType === 'cover') {
        const titleZone = slideLayout.title!;
        const displayTitle = titleZone.textTransform === 'uppercase' ? slide.title.toUpperCase() : slide.title;
        const titleLines = wrapText(displayTitle, titleZone.fontSize, titleZone.maxWidth);

        if (slideLayout.badge) {
            svgContent += buildBadgeElement(slideLayout.badge, titleLines.length, titleZone.fontSize, titleZone.lineHeight);
            svgContent += '\n    ';
        }
        svgContent += buildTextElement(titleZone, slide.title, fontFamily);
        if (slideLayout.subtitle && slide.content) {
            svgContent += '\n    ';
            svgContent += buildTextElement(slideLayout.subtitle, slide.content, fontFamily);
        }
    } else if (slide.slideType === 'cta') {
        const titleZone = slideLayout.title!;
        const displayTitle = titleZone.textTransform === 'uppercase' ? slide.title.toUpperCase() : slide.title;
        const titleLines = wrapText(displayTitle, titleZone.fontSize, titleZone.maxWidth);

        if (slideLayout.badge) {
            svgContent += buildBadgeElement(slideLayout.badge, titleLines.length, titleZone.fontSize, titleZone.lineHeight);
            svgContent += '\n    ';
        }
        svgContent += buildTextElement(titleZone, slide.title, fontFamily);
        if (slideLayout.actions) {
            svgContent += '\n    ';
            svgContent += buildCTAActions(slideLayout.actions, fontFamily);
        }
    } else {
        // content slide
        if (slideLayout.body) {
            svgContent += buildTextElement(slideLayout.body, slide.content, fontFamily);
        }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    ${svgContent}
</svg>`;

    return Buffer.from(svg);
}

export async function overlayTextOnImage(
    imageBase64: string,
    slide: SlideData,
    platform: Platform,
    fontFamily: string,
    styleOverrides?: { badgeColor?: string; textColor?: string; accent?: string }
): Promise<string> {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const svgBuffer = buildTextSVG(slide, platform, fontFamily, styleOverrides);
    const layout = LAYOUT_PRESETS[platform];

    const result = await sharp(imageBuffer)
        .resize(layout.width, layout.height, { fit: 'cover' })
        .composite([{ input: svgBuffer, top: 0, left: 0 }])
        .png()
        .toBuffer();

    return result.toString('base64');
}
