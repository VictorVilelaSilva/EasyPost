import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center shrink-0 ${className || ''}`}>
            <Image
                src="/logo.png"
                alt="EasyPost Logo"
                width={600}
                height={200}
                className="h-[1.5em] w-auto object-contain"
                priority
            />
        </div>
    );
}

export function LogoIcon({ className }: { className?: string }) {
    return (
        <div className={`flex items-center shrink-0 ${className || ''}`}>
            <Image
                src="/logo.png"
                alt="EasyPost Logo Icon"
                width={200}
                height={200}
                className="h-[1.5em] w-auto object-contain"
                priority
            />
        </div>
    );
}
