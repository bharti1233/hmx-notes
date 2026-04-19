import { Sparkles } from 'lucide-react';

interface AuraLogoProps {
  size?: number;
  className?: string;
}

export function AuraLogo({ size = 28, className = '' }: AuraLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-primary shadow-fab ${className}`}
      style={{ width: size, height: size }}
    >
      <Sparkles className="text-primary-foreground" style={{ width: size * 0.6, height: size * 0.6 }} strokeWidth={2.5} />
    </div>
  );
}
