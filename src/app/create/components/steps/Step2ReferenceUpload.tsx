'use client';

import ReferenceUpload from '../ReferenceUpload';
import { ReferenceImages } from '@/types';

interface Props {
    referenceImages: ReferenceImages;
    onUpdate: (images: ReferenceImages) => void;
    onContinue: () => void;
    onSkip: () => void;
    onBack: () => void;
}

export default function Step2ReferenceUpload({ referenceImages, onUpdate, onContinue, onSkip, onBack }: Props) {
    return (
        <ReferenceUpload
            referenceImages={referenceImages}
            onUpdate={onUpdate}
            onContinue={onContinue}
            onSkip={onSkip}
            onBack={onBack}
        />
    );
}
