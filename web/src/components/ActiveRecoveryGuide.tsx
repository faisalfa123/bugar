import React, { useEffect, useRef } from 'react';
import { Play, SkipForward, Plus, Minus, Wind } from 'lucide-react';

interface ActiveRecoveryGuideProps {
  remainingSeconds: number;
  totalSeconds: number;
  nextExerciseName?: string;
  nextSetInfo?: string;
  onSkipRest: () => void;
  onAdjustSeconds: (delta: number) => void;
}

export const ActiveRecoveryGuide: React.FC<ActiveRecoveryGuideProps> = ({
  remainingSeconds,
  totalSeconds,
  nextExerciseName,
  nextSetInfo,
  onSkipRest,
  onAdjustSeconds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active walking in place / gentle shakeout canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Floor line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, h - 14);
      ctx.lineTo(w - 10, h - 14);
      ctx.stroke();

      t += 0.05;

      const cx = w / 2;
      const baseGround = h - 14;

      // Vertical bounce
      const bounce = Math.abs(Math.sin(t * 2)) * 4;
      const hipY = baseGround - 48 - bounce;

      // Legs walking in place
      const legPhase = Math.sin(t * 2);
      const leftFootLift = Math.max(0, legPhase) * 12;
      const rightFootLift = Math.max(0, -legPhase) * 12;

      // Spine & Head
      const headY = hipY - 26;
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Head
      ctx.beginPath();
      ctx.arc(cx, headY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.beginPath();
      ctx.moveTo(cx, headY + 7);
      ctx.lineTo(cx, hipY);
      ctx.stroke();

      // Arms gentle shakeout swinging
      const armSwing = Math.sin(t * 2) * 10;
      ctx.strokeStyle = '#10b981';
      // Left arm
      ctx.beginPath();
      ctx.moveTo(cx, headY + 11);
      ctx.lineTo(cx - 10 - armSwing * 0.4, headY + 22);
      ctx.lineTo(cx - 12 - armSwing, headY + 33);
      ctx.stroke();

      // Right arm
      ctx.beginPath();
      ctx.moveTo(cx, headY + 11);
      ctx.lineTo(cx + 10 + armSwing * 0.4, headY + 22);
      ctx.lineTo(cx + 12 + armSwing, headY + 33);
      ctx.stroke();

      // Left leg
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(cx - 4, hipY);
      ctx.lineTo(cx - 8, hipY + 24 - leftFootLift * 0.5);
      ctx.lineTo(cx - 8, baseGround - leftFootLift);
      ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(cx + 4, hipY);
      ctx.lineTo(cx + 8, hipY + 24 - rightFootLift * 0.5);
      ctx.lineTo(cx + 8, baseGround - rightFootLift);
      ctx.stroke();

      // Breathing air rings
      const ringScale = (t % 2) / 2;
      ctx.strokeStyle = `rgba(16, 185, 129, ${1 - ringScale})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx + 12, headY - 2, 4 + ringScale * 8, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  const progressPercent = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-blue-500/40 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Animated Guide & Coaching Cue */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative w-28 h-24 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
          <canvas ref={canvasRef} width={112} height={96} className="w-full h-full object-contain" />
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold">
            Jalan Santai
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Wind className="w-3.5 h-3.5 animate-pulse text-blue-400" />
            <span>Jeda Istirahat Aktif</span>
          </div>
          <p className="text-sm font-black text-white mt-0.5">
            Tarik napas hidung, buang lewat mulut
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {nextExerciseName ? (
              <span>Siapkan: <strong className="text-slate-200">{nextExerciseName}</strong> {nextSetInfo && `(${nextSetInfo})`}</span>
            ) : (
              'Turunkan detak jantung sebelum set berikutnya'
            )}
          </p>
        </div>
      </div>

      {/* Right: Giant Countdown Ring & Controls */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Countdown Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950 border border-blue-500/30">
          <span className="text-2xl sm:text-3xl font-black font-mono text-white">
            {remainingSeconds}s
          </span>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onAdjustSeconds(30)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-[10px] font-bold"
              title="Tambah 30 Detik"
            >
              +30s
            </button>
            <button
              onClick={() => onAdjustSeconds(-15)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold"
              title="Kurangi 15 Detik"
            >
              -15s
            </button>
          </div>
        </div>

        {/* Skip Rest Button */}
        <button
          onClick={onSkipRest}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all flex-shrink-0"
        >
          <SkipForward size={14} /> Langsung Next
        </button>
      </div>
    </div>
  );
};
