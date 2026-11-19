import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { ExerciseGuide } from '../data/exerciseGuides';
import { MuscleHeatmap } from './MuscleHeatmap';

interface ExerciseFormPlayerProps {
  guide: ExerciseGuide;
  onClose?: () => void;
}

export const ExerciseFormPlayer: React.FC<ExerciseFormPlayerProps> = ({ guide, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1 | 1.5>(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'Turun (Eksentrik)' | 'Tahan (Isometrik)' | 'Dorong (Konsentrik)'>('Turun (Eksentrik)');
  const [jointAngle, setJointAngle] = useState(170);
  const [activeTab, setActiveTab] = useState<'animation' | 'anatomy' | 'checklist'>('animation');

  // Web Audio API context ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = (freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    let lastPhase = '';

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Floor grid line
      const floorY = height * 0.78;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, floorY);
      ctx.lineTo(width - 20, floorY);
      ctx.stroke();

      // Floor tick marks
      for (let x = 40; x < width - 20; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, floorY);
        ctx.lineTo(x + 10, floorY + 8);
        ctx.stroke();
      }

      // Biomechanical Simulation calculation based on animationType
      const cycle = (Math.sin(t) + 1) / 2; // 0 to 1

      // Determine phase and current joint angle
      let phaseText: 'Turun (Eksentrik)' | 'Tahan (Isometrik)' | 'Dorong (Konsentrik)' = 'Turun (Eksentrik)';
      let angle = 170;

      if (guide.animationType === 'pushup') {
        // Pushup animation
        const descent = cycle * 45; // 0 (up) to 45 (down)
        angle = Math.round(175 - cycle * 85); // 175 deg to 90 deg elbow
        setJointAngle(angle);

        if (cycle > 0.9) {
          phaseText = 'Tahan (Isometrik)';
        } else if (Math.cos(t) < 0) {
          phaseText = 'Dorong (Konsentrik)';
        } else {
          phaseText = 'Turun (Eksentrik)';
        }

        const handX = width * 0.38;
        const handY = floorY;
        const footX = width * 0.78;
        const footY = floorY;

        const shoulderX = handX;
        const shoulderY = floorY - 55 + descent;
        const hipX = width * 0.58;
        const hipY = floorY - 45 + descent * 0.75;
        const headX = handX - 25;
        const headY = shoulderY - 8;

        // Elbow calculation
        const elbowX = handX + 22;
        const elbowY = handY - (floorY - shoulderY) * 0.5 + (descent * 0.2);

        // Draw Straight Torso Spine Line (Green indicator for correct posture)
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(hipX, hipY);
        ctx.lineTo(footX, footY);
        ctx.stroke();

        // Arm bones (Shoulder to Elbow, Elbow to Hand)
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(handX, handY);
        ctx.stroke();

        // Joint nodes
        ctx.fillStyle = '#FFFFFF';
        [
          [handX, handY],
          [elbowX, elbowY],
          [shoulderX, shoulderY],
          [hipX, hipY],
          [footX, footY],
        ].forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Head
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.arc(headX, headY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Draw Elbow Angle Arc Indicator
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(elbowX, elbowY, 16, Math.PI * 0.5, Math.PI * 0.5 + (180 - angle) * (Math.PI / 180));
        ctx.stroke();

        // Angle text near elbow
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${angle}°`, elbowX + 18, elbowY - 2);

      } else if (guide.animationType === 'squat') {
        // Bodyweight Squat animation
        const descent = cycle * 55;
        angle = Math.round(180 - cycle * 95); // Knee angle
        setJointAngle(angle);

        if (cycle > 0.88) {
          phaseText = 'Tahan (Isometrik)';
        } else if (Math.cos(t) < 0) {
          phaseText = 'Dorong (Konsentrik)';
        } else {
          phaseText = 'Turun (Eksentrik)';
        }

        const footX = width * 0.5;
        const footY = floorY;
        const kneeX = footX + 18 - (descent * 0.1);
        const kneeY = floorY - 55 + (descent * 0.3);
        const hipX = footX - 22 - (descent * 0.4);
        const hipY = floorY - 110 + descent;
        const shoulderX = hipX + 16 + (descent * 0.2);
        const shoulderY = hipY - 60;
        const headX = shoulderX + 4;
        const headY = shoulderY - 16;

        // Draw Torso & Legs
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.stroke();

        // Arms stretched forward for balance
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(shoulderX + 42, shoulderY + 8);
        ctx.stroke();

        // Joints
        ctx.fillStyle = '#FFFFFF';
        [[footX, footY], [kneeX, kneeY], [hipX, hipY], [shoulderX, shoulderY]].forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Head
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.arc(headX, headY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Knee Angle Indicator
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(kneeX, kneeY, 18, 0, Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${angle}°`, kneeX + 22, kneeY + 4);

      } else {
        // Isometric Plank / Other movements
        angle = 180;
        setJointAngle(angle);
        phaseText = 'Tahan (Isometrik)';

        const handX = width * 0.35;
        const handY = floorY;
        const footX = width * 0.78;
        const footY = floorY;
        const shoulderX = handX;
        const shoulderY = floorY - 45;
        const hipX = width * 0.58;
        const hipY = floorY - 45;
        const headX = handX - 22;
        const headY = shoulderY - 6;

        // Spine Line
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(hipX, hipY);
        ctx.lineTo(footX, footY);
        ctx.stroke();

        // Forearm on floor
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(handX, handY);
        ctx.lineTo(handX + 24, handY);
        ctx.stroke();

        // Joints
        ctx.fillStyle = '#FFFFFF';
        [[handX, handY], [shoulderX, shoulderY], [hipX, hipY], [footX, footY]].forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.arc(headX, headY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('180° GARIS LURUS (SEMPURNA)', width * 0.32, floorY - 65);
      }

      // Audio Beep at turnaround points
      if (phaseText !== lastPhase) {
        setCurrentPhase(phaseText);
        if (phaseText === 'Tahan (Isometrik)') {
          playBeep(880, 0.08); // High tone beep on bottom pause
        } else if (phaseText === 'Dorong (Konsentrik)') {
          playBeep(520, 0.06);
        } else {
          playBeep(440, 0.05);
        }
        lastPhase = phaseText;
      }

      if (isPlaying) {
        t += 0.035 * speed;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [guide.animationType, isPlaying, speed, soundEnabled]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full mx-auto">
      {/* Header with Exercise Title & Badges */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{guide.name}</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              {guide.category}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
              {guide.tempo} Tempo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{guide.description}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Tutup Panduan"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 text-xs">
        <button
          onClick={() => setActiveTab('animation')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'animation'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye size={14} />
          Animasi Vektor 60fps
        </button>
        <button
          onClick={() => setActiveTab('anatomy')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'anatomy'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb size={14} />
          Peta Otot Anatomi
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'checklist'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 size={14} />
          Checklist Form Benar
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5">
        {activeTab === 'animation' && (
          <div className="space-y-4">
            {/* 60fps Biomechanical Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={560}
                height={260}
                className="w-full h-auto block"
              />

              {/* Real-time Angle & Phase HUD */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono">
                <span className="text-slate-400 text-[10px] block">Fase Gerakan</span>
                <span className="text-emerald-400 font-bold">{currentPhase}</span>
              </div>

              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-right">
                <span className="text-slate-400 text-[10px] block">Sudut Sendi</span>
                <span className="text-amber-400 font-bold">{jointAngle}°</span>
              </div>
            </div>

            {/* Video Controls & Metronome */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  aria-label={isPlaying ? 'Jeda Animasi' : 'Putar Animasi'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? 'Jeda' : 'Putar'}
                </button>

                <button
                  onClick={() => setSpeed(speed === 1 ? 0.5 : speed === 0.5 ? 1.5 : 1)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
                  title="Kecepatan Gerak Lambat"
                >
                  {speed}x Laju
                </button>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    soundEnabled
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title="Metronom Suara Repetisi (Web Audio)"
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              </div>

              {/* Tempo Guidance */}
              <div className="text-right text-[11px] text-slate-400 font-medium">
                Irama Kadens: <span className="text-white font-bold">{guide.tempo}</span> (Turun-Tahan-Dorong)
              </div>
            </div>

            {/* Quick Setup Checklist */}
            <div className="bg-slate-900/30 p-3.5 rounded-xl border border-slate-800/60 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Langkah Eksekusi Kunci:
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {guide.executionSteps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'anatomy' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
              <MuscleHeatmap
                primaryMuscles={guide.primaryMuscles}
                secondaryMuscles={guide.secondaryMuscles}
                width={260}
                height={210}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Otot Target Utama</p>
                <div className="flex flex-wrap gap-1.5">
                  {guide.primaryMuscles.map((m) => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium capitalize">
                      {m.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">Otot Sinergis / Penopang</p>
                <div className="flex flex-wrap gap-1.5">
                  {guide.secondaryMuscles.map((m) => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium capitalize">
                      {m.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-4">
            {/* Common Mistakes vs Fix */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Kesalahan Umum & Cara Mencegahnya:
              </h4>
              <div className="space-y-2">
                {guide.commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl text-xs text-rose-200 leading-relaxed flex items-start gap-2">
                    <span className="font-bold text-rose-400">{idx + 1}.</span>
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb size={14} />
                Tips Ahli Biomekanika:
              </h4>
              <div className="space-y-2">
                {guide.proTips.map((tip, idx) => (
                  <div key={idx} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-200 leading-relaxed">
                    💡 {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
