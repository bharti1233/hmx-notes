interface HmxLogoProps {
  size?: number;
  className?: string;
}

export function HmxLogo({ size = 36, className = '' }: HmxLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-primary shadow-fab text-primary-foreground font-display font-extrabold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.32, letterSpacing: '-0.04em' }}
      aria-label="HMX Notes"
    >
      HMX
    </div>
  );
}
