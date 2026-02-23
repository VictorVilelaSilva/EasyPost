'use client';

/**
 * Extracts dominant colors from an uploaded image using Canvas API.
 * Returns an array of hex color strings sorted by frequency.
 */
export async function extractColorsFromImage(file: File, maxColors: number = 5): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = () => {
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas not supported'));
                        return;
                    }

                    // Scale down for performance
                    const scale = Math.min(1, 100 / Math.max(img.width, img.height));
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixels = imageData.data;

                    // Count color frequencies (quantized to reduce noise)
                    const colorMap = new Map<string, number>();

                    for (let i = 0; i < pixels.length; i += 4) {
                        const r = Math.round(pixels[i] / 16) * 16;
                        const g = Math.round(pixels[i + 1] / 16) * 16;
                        const b = Math.round(pixels[i + 2] / 16) * 16;
                        const a = pixels[i + 3];

                        // Skip transparent and near-white/near-black pixels
                        if (a < 128) continue;
                        if (r > 240 && g > 240 && b > 240) continue;
                        if (r < 15 && g < 15 && b < 15) continue;

                        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
                    }

                    // Sort by frequency and take top colors
                    const sorted = [...colorMap.entries()]
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, maxColors)
                        .map(([hex]) => hex);

                    resolve(sorted.length > 0 ? sorted : ['#1a2744', '#ffffff', '#3b82f6']);
                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = reader.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
