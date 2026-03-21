const MAX_DIMENSION = 1500;
const QUALITY = 0.8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type ImageValidationError = 'too-large' | 'invalid-format' | 'corrupted';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function validateImageFile(file: File): ImageValidationError | null {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'invalid-format';
    if (file.size > MAX_FILE_SIZE) return 'too-large';
    return null;
}

export function resizeImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;

                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height / width) * MAX_DIMENSION);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round((width / height) * MAX_DIMENSION);
                        height = MAX_DIMENSION;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context unavailable'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/png', QUALITY);
                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error('corrupted'));
            img.src = reader.result as string;
        };
        reader.onerror = () => reject(new Error('corrupted'));
        reader.readAsDataURL(file);
    });
}
