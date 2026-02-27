import { Loader2 } from 'lucide-react';

interface LoadingCardProps {
    message: string;
    color?: 'primary' | 'accent';
}

export default function LoadingCard({ message, color = 'primary' }: LoadingCardProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 glass-card-static border-dashed mb-8 animate-reveal">
            <Loader2
                className={`animate-spin mb-4 ${color === 'primary' ? 'text-primary' : 'text-accent'}`}
                size={40}
            />
            <p className="font-medium text-muted font-body">
                {message}
            </p>
        </div>
    );
}
