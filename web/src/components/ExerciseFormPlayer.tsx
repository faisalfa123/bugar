import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { ExerciseGuide } from '../data/exerciseGuides';
import { MuscleHeatmap } from './MuscleHeatmap';
import { t } from '../data/i18n';

interface ExerciseFormPlayerProps {
  guide: ExerciseGuide;
  onClose?: () => void;
}

export const ExerciseFormPlayer: React.FC<ExerciseFormPlayerProps> = ({ guide, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Display mode: 'video' (Real Human Video / 3D) or 'realistic2d' (Detailed 2D Anatomy Motion)
  const [displayMode, setDisplayMode] = useState<'video' | 'realistic2d'>('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1 | 1.5>(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'Turun (Eksentrik)' | 'Tahan (Isometrik)' | 'Dorong (Konsentrik)'>('Turun (Eksentrik)');
  const [jointAngle, setJointAngle] = useState(170);
  const [activeTab, setActiveTab] = useState<'visual' | 'anatomy' | 'checklist'>('visual');

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
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Sync video playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [speed, isPlaying, displayMode]);

  // Detailed 2D Anatomical Canvas Animation Engine
  useEffect(() => {
    if (displayMode !== 'realistic2d') return;

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

      // Background subtle gym grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const floorY = height * 0.82;

      // Draw Floor line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, floorY);
      ctx.lineTo(width - 20, floorY);
      ctx.stroke();

      // Cycle calculation: 0 to 1
      const cycle = (Math.sin(t) + 1) / 2;

      let phaseText: 'Turun (Eksentrik)' | 'Tahan (Isometrik)' | 'Dorong (Konsentrik)' = 'Turun (Eksentrik)';
      let angle = 170;

      // Helper for drawing realistic shaded muscular limb
      const drawMuscleLimb = (x1: number, y1: number, x2: number, y2: number, radius: number, color: string, activeGlow: boolean) => {
        ctx.save();
        ctx.strokeStyle = activeGlow ? '#10B981' : color;
        ctx.lineWidth = radius * 2;
        ctx.lineCap = 'round';
        if (activeGlow) {
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      };

      // Helper for drawing anatomical joint pivot
      const drawJoint = (x: number, y: number, r = 5) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      // -------------------------------------------------------------
      // EXERCISE MOVEMENT RENDERING (Accurate Biomechanics)
      // -------------------------------------------------------------

      if (guide.animationType === 'pullup') {
        // ACCURATE VERTICAL PULL-UP: Chin-up bar at the top, vertical elevation
        const barY = height * 0.18;
        const barLeft = width * 0.25;
        const barRight = width * 0.75;

        // Draw Steel Pull-up Bar
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(barLeft, barY);
        ctx.lineTo(barRight, barY);
        ctx.stroke();

        // Bar Mount Brackets
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(barLeft + 15, 0);
        ctx.lineTo(barLeft + 15, barY);
        ctx.moveTo(barRight - 15, 0);
        ctx.lineTo(barRight - 15, barY);
        ctx.stroke();

        // Elevation: 0 = dead hang, 1 = chin over bar
        const pullHeight = cycle * 65;
        angle = Math.round(175 - cycle * 105); // 175 deg (hang) down to 70 deg (top pull)
        setJointAngle(angle);

        if (cycle > 0.92) {
          phaseText = 'Tahan (Isometrik)';
        } else if (Math.cos(t) > 0) {
          phaseText = 'Dorong (Konsentrik)'; // Pulling up
        } else {
          phaseText = 'Turun (Eksentrik)'; // Lowering down
        }

        const handLX = width * 0.42;
        const handRX = width * 0.58;
        const handY = barY;

        const shoulderY = barY + 75 - pullHeight;
        const shoulderLX = width * 0.44;
        const shoulderRX = width * 0.56;

        const elbowLX = handLX - 18 - (cycle * 12);
        const elbowRX = handRX + 18 + (cycle * 12);
        const elbowY = shoulderY + 5 - (cycle * 15);

        const hipY = shoulderY + 65;
        const hipX = width * 0.5;

        const kneeY = hipY + 50;
        const kneeX = hipX + 8; // slight hollow body tilt
        const feetY = kneeY + 45;
        const feetX = kneeX - 4;

        const headX = width * 0.5;
        const headY = shoulderY - 22;

        // Draw Latissimus Dorsi Back Muscles (Active Emerald Glow)
        ctx.fillStyle = '#065F46';
        ctx.beginPath();
        ctx.moveTo(shoulderLX, shoulderY);
        ctx.lineTo(shoulderRX, shoulderY);
        ctx.lineTo(hipX + 16, hipY);
        ctx.lineTo(hipX - 16, hipY);
        ctx.closePath();
        ctx.fill();

        // Limbs & Core
        drawMuscleLimb(shoulderLX, shoulderY, elbowLX, elbowY, 5, '#0284C7', true); // Upper arms / Biceps
        drawMuscleLimb(elbowLX, elbowY, handLX, handY, 4, '#38BDF8', false); // Forearms
        drawMuscleLimb(shoulderRX, shoulderY, elbowRX, elbowY, 5, '#0284C7', true);
        drawMuscleLimb(elbowRX, elbowY, handRX, handY, 4, '#38BDF8', false);

        // Legs (Hollow body position)
        drawMuscleLimb(hipX, hipY, kneeX, kneeY, 7, '#334155', false);
        drawMuscleLimb(kneeX, kneeY, feetX, feetY, 5, '#475569', false);

        // Head
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(headX, headY, 13, 0, Math.PI * 2);
        ctx.fill();

        // Joints
        [
          [handLX, handY], [handRX, handY],
          [elbowLX, elbowY], [elbowRX, elbowY],
          [shoulderLX, shoulderY], [shoulderRX, shoulderY],
          [hipX, hipY], [kneeX, kneeY], [feetX, feetY]
        ].forEach(([x, y]) => drawJoint(x, y));

        // Angle indicator
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`SIKU: ${angle}°`, elbowLX - 55, elbowY);

        if (cycle > 0.88) {
          ctx.fillStyle = '#10B981';
          ctx.fillText('✓ DAGU MELEWATI PALANG', width * 0.32, barY - 14);
        }

      } else if (guide.animationType === 'pushup') {
        // ACCURATE PUSH-UP: Head to heel straight line, elbows at 45 deg, chest depth
        const descent = cycle * 42;
        angle = Math.round(175 - cycle * 85);
        setJointAngle(angle);

        if (cycle > 0.9) {
          phaseText = 'Tahan (Isometrik)';
        } else if (Math.cos(t) < 0) {
          phaseText = 'Dorong (Konsentrik)';
        } else {
          phaseText = 'Turun (Eksentrik)';
        }

        const handX = width * 0.36;
        const handY = floorY;
        const footX = width * 0.78;
        const footY = floorY;

        const shoulderX = handX;
        const shoulderY = floorY - 56 + descent;
        const hipX = width * 0.58;
        const hipY = floorY - 45 + (descent * 0.75);
        const headX = handX - 25;
        const headY = shoulderY - 8;

        const elbowX = handX + 20;
        const elbowY = handY - (floorY - shoulderY) * 0.5 + (descent * 0.2);

        // Torso Musculature (Chest active)
        drawMuscleLimb(shoulderX, shoulderY, hipX, hipY, 10, '#047857', true);
        drawMuscleLimb(hipX, hipY, footX, footY, 8, '#334155', false);

        // Arms (Triceps active)
        drawMuscleLimb(shoulderX, shoulderY, elbowX, elbowY, 5, '#0284C7', true);
        drawMuscleLimb(elbowX, elbowY, handX, handY, 4, '#38BDF8', false);

        // Head
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(headX, headY, 12, 0, Math.PI * 2);
        ctx.fill();

        [[handX, handY], [elbowX, elbowY], [shoulderX, shoulderY], [hipX, hipY], [footX, footY]].forEach(([x, y]) => drawJoint(x, y));

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`SIKU: ${angle}°`, elbowX + 10, elbowY - 6);

      } else if (guide.animationType === 'squat') {
        // ACCURATE SQUAT: Hip hinge, knees tracking over toes, thighs parallel
        const depth = cycle * 55;
        angle = Math.round(175 - cycle * 85);
        setJointAngle(angle);

        if (cycle > 0.9) {
          phaseText = 'Tahan (Isometrik)';
        } else if (Math.cos(t) < 0) {
          phaseText = 'Dorong (Konsentrik)';
        } else {
          phaseText = 'Turun (Eksentrik)';
        }

        const footX = width * 0.52;
        const footY = floorY;

        const kneeX = footX + (cycle * 22);
        const kneeY = floorY - 65 + (depth * 0.45);

        const hipX = footX - 35 - (cycle * 25);
        const hipY = kneeY - 10 + (depth * 0.5);

        const shoulderX = hipX + 18 + (cycle * 12);
        const shoulderY = hipY - 68;

        const headX = shoulderX;
        const headY = shoulderY - 20;

        // Torso & Quads (High Emerald Glow on Quads)
        drawMuscleLimb(shoulderX, shoulderY, hipX, hipY, 11, '#334155', false);
        drawMuscleLimb(hipX, hipY, kneeX, kneeY, 10, '#047857', true); // Thighs / Quads
        drawMuscleLimb(kneeX, kneeY, footX, footY, 7, '#475569', false); // Calves

        // Arms stretched forward for balance
        drawMuscleLimb(shoulderX, shoulderY, shoulderX + 45, shoulderY + 6, 4, '#38BDF8', false);

        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(headX, headY, 13, 0, Math.PI * 2);
        ctx.fill();

        [[footX, footY], [kneeX, kneeY], [hipX, hipY], [shoulderX, shoulderY]].forEach(([x, y]) => drawJoint(x, y));

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`LUTUT: ${angle}°`, kneeX + 15, kneeY + 4);

        if (cycle > 0.88) {
          ctx.fillStyle = '#10B981';
          ctx.fillText('✓ KEDALAMAN PARALEL (90°)', width * 0.28, floorY - 110);
        }

      } else if (guide.animationType === 'lunge') {
        // ACCURATE FORWARD LUNGE: Front knee 90 deg, back knee near floor
        const depth = cycle * 48;
        angle = Math.round(175 - cycle * 85);
        setJointAngle(angle);

        if (cycle > 0.9) {
          phaseText = 'Tahan (Isometrik)';
        } else if (Math.cos(t) < 0) {
          phaseText = 'Dorong (Konsentrik)';
        } else {
          phaseText = 'Turun (Eksentrik)';
        }

        const frontFootX = width * 0.38;
        const frontFootY = floorY;
        const backFootX = width * 0.68;
        const backFootY = floorY;

        const frontKneeX = frontFootX + 4;
        const frontKneeY = floorY - 55 + (depth * 0.5);

        const hipX = width * 0.48;
        const hipY = frontKneeY - 12 + (depth * 0.45);

        const backKneeX = backFootX - 18;
        const backKneeY = floorY - 15 - (cycle * 2);

        const shoulderX = hipX;
        const shoulderY = hipY - 65;
        const headX = shoulderX;
        const headY = shoulderY - 18;

        // Front leg (Quads active)
        drawMuscleLimb(hipX, hipY, frontKneeX, frontKneeY, 9, '#047857', true);
        drawMuscleLimb(frontKneeX, frontKneeY, frontFootX, frontFootY, 6, '#475569', false);

        // Back leg
        drawMuscleLimb(hipX, hipY, backKneeX, backKneeY, 8, '#334155', false);
        drawMuscleLimb(backKneeX, backKneeY, backFootX, backFootY, 5, '#475569', false);

        // Torso upright
        drawMuscleLimb(shoulderX, shoulderY, hipX, hipY, 10, '#334155', false);

        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(headX, headY, 12, 0, Math.PI * 2);
        ctx.fill();

        [[frontFootX, frontFootY], [frontKneeX, frontKneeY], [hipX, hipY], [backKneeX, backKneeY], [backFootX, backFootY], [shoulderX, shoulderY]].forEach(([x, y]) => drawJoint(x, y));

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`LUTUT DEPAN: ${angle}°`, frontKneeX - 70, frontKneeY - 12);

      } else if (guide.animationType === 'bicep_curl') {
        // ACCURATE BICEP CURL: Elbow pinned at side, strict forearm curl, bicep ball contraction
        angle = Math.round(175 - cycle * 125); // 175 deg down to 50 deg peak curl
        setJointAngle(angle);

        if (cycle > 0.9) {
          phaseText = 'Tahan (Isometrik)';
        } else if (Math.cos(t) > 0) {
          phaseText = 'Dorong (Konsentrik)';
        } else {
          phaseText = 'Turun (Eksentrik)';
        }

        const footX = width * 0.48;
        const footY = floorY;
        const hipX = width * 0.48;
        const hipY = floorY - 95;
        const shoulderX = width * 0.48;
        const shoulderY = hipY - 70;
        const headX = shoulderX;
        const headY = shoulderY - 20;

        const elbowX = shoulderX + 8;
        const elbowY = shoulderY + 45;

        // Forearm angle trigonometrics
        const curlAngleRad = (angle * Math.PI) / 180;
        const handX = elbowX + Math.sin(curlAngleRad) * 42;
        const handY = elbowY + Math.cos(curlAngleRad) * 42;

        // Torso & Legs
        drawMuscleLimb(footX, footY, hipX, hipY, 9, '#334155', false);
        drawMuscleLimb(hipX, hipY, shoulderX, shoulderY, 11, '#334155', false);

        // Bicep (Bright active highlight and bulging peak on contraction)
        const bicepBulge = 6 + (cycle * 5);
        drawMuscleLimb(shoulderX, shoulderY, elbowX, elbowY, bicepBulge, '#047857', true);
        drawMuscleLimb(elbowX, elbowY, handX, handY, 5, '#38BDF8', false);

        // Dumbbell / Weight in hand
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(handX - 6, handY - 12, 12, 24);
        ctx.fillStyle = '#64748B';
        ctx.fillRect(handX - 3, handY - 8, 6, 16);

        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(headX, headY, 13, 0, Math.PI * 2);
        ctx.fill();

        [[footX, footY], [hipX, hipY], [shoulderX, shoulderY], [elbowX, elbowY], [handX, handY]].forEach(([x, y]) => drawJoint(x, y));

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`SIKU: ${angle}°`, elbowX + 15, elbowY);

      } else {
        // PLANK ISOMETRIC
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

        // Spine Line (Green indicator)
        drawMuscleLimb(shoulderX, shoulderY, hipX, hipY, 10, '#047857', true);
        drawMuscleLimb(hipX, hipY, footX, footY, 8, '#334155', false);

        // Forearm flat on floor
        drawMuscleLimb(shoulderX, shoulderY, handX, handY, 5, '#38BDF8', false);
        drawMuscleLimb(handX, handY, handX + 25, handY, 5, '#38BDF8', false);

        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(headX, headY, 12, 0, Math.PI * 2);
        ctx.fill();

        [[handX, handY], [shoulderX, shoulderY], [hipX, hipY], [footX, footY]].forEach(([x, y]) => drawJoint(x, y));

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('180° GARIS LURUS NETRAL (SEMPURNA)', width * 0.28, floorY - 60);
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
        t += 0.038 * speed;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [guide.animationType, isPlaying, speed, displayMode]);

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {guide.category}
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-slate-800 text-slate-300">
              Tempo {guide.tempo}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            {guide.name}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            style={{ cursor: 'pointer' }}
            aria-label={t('close')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Mode Switcher: Video Manusia Asli vs Animasi 2D Anatomi Detail */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDisplayMode('video')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              displayMode === 'video'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ cursor: 'pointer' }}
          >
            🎬 {t('modeRealVideo')}
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('realistic2d')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              displayMode === 'realistic2d'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ cursor: 'pointer' }}
          >
            🏃‍♂️ {t('modeRealistic2d')}
          </button>
        </div>

        {/* Speed & Metronome controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            {([0.5, 1, 1.5] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  speed === s ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{ cursor: 'pointer' }}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            style={{ cursor: 'pointer' }}
            title={t('metronome')}
            aria-label={t('metronome')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
        {displayMode === 'video' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={guide.videoUrl}
              poster={guide.posterUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-bold text-emerald-400 border border-emerald-500/30">
              HD Real Human Video
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-full max-h-[360px] object-contain"
          />
        )}

        {/* Biomechanical HUD Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <div className="px-3 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-md">
            <span className="text-[10px] text-slate-400 block font-semibold">{t('jointAngles')}</span>
            <span className="text-sm font-bold font-mono text-amber-400">{jointAngle}°</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-md">
            <span className="text-[10px] text-slate-400 block font-semibold">{t('phaseTempo')}</span>
            <span className="text-xs font-bold text-emerald-400">{currentPhase}</span>
          </div>
        </div>

        {/* Play / Pause Toggle Button */}
        <div className="absolute bottom-3 left-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white transition-all shadow-lg"
            style={{ cursor: 'pointer' }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
        </div>
      </div>

      {/* Tabs: Visual / Anatomi Otot / Form Checklist */}
      <div className="flex border-b border-slate-800 bg-slate-950/20 px-4">
        {[
          { id: 'visual', label: 'Petunjuk Eksekusi' },
          { id: 'anatomy', label: 'Peta Otot Terlibat' },
          { id: 'checklist', label: 'Form Checklist' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={{ cursor: 'pointer' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[320px] space-y-4">
        {activeTab === 'visual' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-2">{t('setupSteps')}</h3>
              <ul className="space-y-2">
                {guide.setupSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-emerald-400 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-200 mb-2">{t('executionSteps')}</h3>
              <ul className="space-y-2">
                {guide.executionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'anatomy' && (
          <div className="space-y-4">
            <MuscleHeatmap
              primaryMuscles={guide.primaryMuscles}
              secondaryMuscles={guide.secondaryMuscles}
            />
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                {t('commonMistakes')}
              </div>
              <ul className="space-y-2">
                {guide.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-1">
                <Lightbulb className="w-4 h-4" />
                {t('proTip')}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {guide.proTips[0]}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
