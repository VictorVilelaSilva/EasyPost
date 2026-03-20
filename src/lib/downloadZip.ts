import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CarouselData } from '../types';

export async function downloadCarouselZip(topic: string, data: CarouselData, images: string[]) {
    const zip = new JSZip();
    const folder = zip.folder(`easypost_${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`);

    if (!folder) return;

    // Add the caption as a text file
    folder.file('caption.txt', data.caption);

    // Add the direct base64 image data
    for (let i = 0; i < images.length; i++) {
        // the image string is "data:image/png;base64,xxxxxx" so we slice it
        const base64Data = images[i].replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        folder.file(`slide_${i + 1}.png`, base64Data, { base64: true });
    }

    // Generate ZIP and trigger download
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `easypost_${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`);
}
