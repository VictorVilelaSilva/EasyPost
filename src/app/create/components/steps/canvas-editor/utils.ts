import { TextBlock } from '@/types';
import { SlideType } from './types';

export function initTextBlocks(slideType: SlideType, title: string, content: string, fontFamily: string): TextBlock[] {
    if (slideType === 'cover') {
        return [
            { id: 'title', text: title || 'TITULO DO POST', xPercent: 10, yPercent: 25, fontSize: 48, color: '#FFFFFF', fontFamily, bold: true, italic: false, textAlign: 'center' },
            { id: 'subtitle', text: content || 'subtitulo aqui', xPercent: 20, yPercent: 65, fontSize: 20, color: '#FFFFFF', fontFamily, bold: false, italic: false, textAlign: 'center' },
        ];
    }
    if (slideType === 'cta') {
        return [
            { id: 'title', text: title || 'Gostou do conteudo?', xPercent: 10, yPercent: 32, fontSize: 40, color: '#FFFFFF', fontFamily, bold: true, italic: false, textAlign: 'center' },
            { id: 'actions', text: content || 'Curta  Comente  Compartilhe', xPercent: 10, yPercent: 52, fontSize: 18, color: '#FFFFFF', fontFamily, bold: false, italic: false, textAlign: 'center' },
        ];
    }
    // content slide
    return [
        { id: 'body', text: content || title || 'Conteudo do slide', xPercent: 10, yPercent: 22, fontSize: 22, color: '#FFFFFF', fontFamily, bold: true, italic: false, textAlign: 'center' },
    ];
}
