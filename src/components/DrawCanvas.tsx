import { useEffect, useRef, useState } from 'react';
import { Check, X, Eraser, RotateCcw } from 'lucide-react';

interface DrawCanvasProps {
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

const COLORS = ['#111827', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export function DrawCanvas({ onCancel, onSave }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [erasing, setErasing] = useState(false);

  // Setup canvas
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    drawing.current = true;
    last.current = getPos(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const c = canvasRef.current!;
    const ctx = c.getContext('2d');
    if (!ctx || !last.current) return;
    const pos = getPos(e);
    ctx.strokeStyle = erasing ? '#ffffff' : color;
    ctx.lineWidth = erasing ? size * 4 : size;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    last.current = pos;
  };

  const end = () => { drawing.current = false; last.current = null; };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const rect = c.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const save = () => {
    const c = canvasRef.current;
    if (!c) return;
    onSave(c.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-in fade-in duration-150">
      <header className="flex items-center justify-between px-3 h-14 border-b border-border">
        <button onClick={onCancel} className="p-2.5 rounded-full hover:bg-muted" aria-label="Cancel">
          <X className="h-5 w-5 text-foreground" />
        </button>
        <p className="font-display font-bold text-foreground">Draw</p>
        <button onClick={save} className="p-2.5 rounded-full hover:bg-muted" aria-label="Save drawing">
          <Check className="h-5 w-5 text-primary" />
        </button>
      </header>

      <div className="flex-1 p-3">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="w-full h-full rounded-xl bg-white border border-border touch-none"
          style={{ touchAction: 'none' }}
        />
      </div>

      <div className="px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-card border border-border shadow-soft">
          <div className="flex items-center gap-1.5">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setErasing(false); }}
                aria-label={`Color ${c}`}
                className={`h-7 w-7 rounded-full border-2 transition-transform active:scale-90 ${
                  !erasing && color === c ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={2}
              max={16}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-20 accent-primary"
              aria-label="Brush size"
            />
            <button
              onClick={() => setErasing(e => !e)}
              className={`p-2 rounded-lg ${erasing ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
              aria-label="Eraser"
            >
              <Eraser className="h-4 w-4" />
            </button>
            <button onClick={clear} className="p-2 rounded-lg text-foreground hover:bg-muted" aria-label="Clear">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
