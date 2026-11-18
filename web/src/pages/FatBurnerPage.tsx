import React, { useState, useEffect, useRef } from 'react';
import { FatBurnerProgram, FatBurnerLog, UserProfile } from '../types';
import { FAT_BURNER_PROGRAMS } from '../data/fatBurnerPrograms';
import { audioSynth } from '../services/audioSynth';
import {
  Zap,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Flame,
  Clock,
  MapPin,
  CheckCircle2,
  Volume2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface FatBurnerPageProps {
  profile: UserProfile;
  fatBurnerLogs: FatBurnerLog[];
  onSaveFatBurnerLog: (log: FatBurnerLog) => void;
  activeProgramIdToLaunch?: string | null;
  onClearActiveLaunch?: () => void;
}

export const FatBurnerPage: React.FC<FatBurnerPageProps> = ({
  profile,
  fatBurnerLogs,
  onSaveFatBurnerLog,
  activeProgramIdToLaunch,
  onClearActiveLaunch,
}) => {
  // Filter state
  const [selectedLocation, setSelectedLocation] = useState<'Semua' | 'Rumah' | 'Gym'>('Semua');
  const [selectedDuration, setSelectedDuration] = useState<number | 'Semua'>('Semua');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('Semua');

  // Player state
  const [activeProgram, setActiveProgram] = useState<FatBurnerProgram | null>(null);
  const [currentIntervalIdx, setCurrentIntervalIdx] = useState<number>(0);
  const [intervalRemainingSec, setIntervalRemainingSec] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sessionElapsedSec, setSessionElapsedSec] = useState<number>(0);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  // Auto-launch if triggered from Mastermind or Quick Action
  useEffect(() => {
    if (activeProgramIdToLaunch) {
      const target = FAT_BURNER_PROGRAMS.find(p => p.id === activeProgramIdToLaunch);
      if (target) {
        startWorkout(target);
      }
      if (onClearActiveLaunch) onClearActiveLaunch();
    }
  }, [activeProgramIdToLaunch]);

  // Interval Countdown Effect
  useEffect(() => {
    if (!activeProgram || isPaused || showCompletionModal) return;

    const timer = setInterval(() => {
      setSessionElapsedSec(prev => prev + 1);

      setIntervalRemainingSec(prev => {
        if (prev <= 1) {
          // Next interval or finish
          const nextIdx = currentIntervalIdx + 1;
          if (nextIdx < activeProgram.intervals.length) {
            setCurrentIntervalIdx(nextIdx);
            const nextInterval = activeProgram.intervals[nextIdx];
            if (nextInterval.isRest) {
              audioSynth.playRestChime();
            } else {
              audioSynth.playWorkWhistle();
            }
            return nextInterval.durationSeconds;
          } else {
            // Completed workout!
            finishWorkout();
            return 0;
          }
        }

        // 3, 2, 1 countdown audio tick
        if (prev <= 4) {
          audioSynth.playCountdownTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeProgram, isPaused, currentIntervalIdx, showCompletionModal]);

  const startWorkout = (program: FatBurnerProgram) => {
    setActiveProgram(program);
    setCurrentIntervalIdx(0);
    setIntervalRemainingSec(program.intervals[0].durationSeconds);
    setIsPaused(false);
    setSessionElapsedSec(0);
    setShowCompletionModal(false);

    if (program.intervals[0].isRest) {
      audioSynth.playRestChime();
    } else {
      audioSynth.playWorkWhistle();
    }
  };

  const finishWorkout = () => {
    if (!activeProgram) return;

    audioSynth.playVictoryFanfare();
    setShowCompletionModal(true);

    const log: FatBurnerLog = {
      id: `fb-log-${Date.now()}`,
      user_id: profile.id,
      date: new Date().toISOString().split('T')[0],
      program_id: activeProgram.id,
      program_name: activeProgram.title,
      duration_seconds: sessionElapsedSec,
      calories_burned: activeProgram.caloriesBurnedEst,
      completed: true,
      updated_at: Date.now(),
    };

    onSaveFatBurnerLog(log);
  };

  const handleSkipNext = () => {
    if (!activeProgram) return;
    const nextIdx = currentIntervalIdx + 1;
    if (nextIdx < activeProgram.intervals.length) {
      setCurrentIntervalIdx(nextIdx);
      setIntervalRemainingSec(activeProgram.intervals[nextIdx].durationSeconds);
      if (activeProgram.intervals[nextIdx].isRest) {
        audioSynth.playRestChime();
      } else {
        audioSynth.playWorkWhistle();
      }
    } else {
      finishWorkout();
    }
  };

  const handleSkipPrev = () => {
    if (!activeProgram || currentIntervalIdx === 0) return;
    const prevIdx = currentIntervalIdx - 1;
    setCurrentIntervalIdx(prevIdx);
    setIntervalRemainingSec(activeProgram.intervals[prevIdx].durationSeconds);
  };

  const handleClosePlayer = () => {
    setActiveProgram(null);
    setShowCompletionModal(false);
  };

  // Filtered programs
  const filteredPrograms = FAT_BURNER_PROGRAMS.filter(p => {
    const matchLoc = selectedLocation === 'Semua' || p.location === selectedLocation;
    const matchDur = selectedDuration === 'Semua' || p.durationMinutes === selectedDuration;
    const matchInt = selectedIntensity === 'Semua' || p.intensity === selectedIntensity;
    return matchLoc && matchDur && matchInt;
  });

  const currentInterval = activeProgram ? activeProgram.intervals[currentIntervalIdx] : null;
  const nextInterval = activeProgram && currentIntervalIdx + 1 < activeProgram.intervals.length
    ? activeProgram.intervals[currentIntervalIdx + 1]
    : null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Zap size={18} />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">Fat Burner Trainer</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gaya Nike Training Club: 12 program terstruktur dengan audio interval player
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 self-start sm:self-auto">
            🔥 {fatBurnerLogs.length} Sesi Diselesaikan
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
          {/* Location */}
          <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800">
            {['Semua', 'Rumah', 'Gym'].map(loc => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc as typeof selectedLocation)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedLocation === loc ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Duration */}
          <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800">
            {['Semua', 7, 15, 30, 45].map(dur => (
              <button
                key={dur.toString()}
                onClick={() => setSelectedDuration(dur as typeof selectedDuration)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedDuration === dur ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {dur === 'Semua' ? 'Semua Durasi' : `${dur}m`}
              </button>
            ))}
          </div>

          {/* Intensity */}
          <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800">
            {['Semua', 'Pemula', 'Menengah', 'Intens'].map(int => (
              <button
                key={int}
                onClick={() => setSelectedIntensity(int)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedIntensity === int ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {int}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map(program => (
          <div
            key={program.id}
            className="p-5 rounded-3xl glass-card border border-slate-800/80 hover:border-orange-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  📍 {program.location}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  program.intensity === 'Intens'
                    ? 'bg-rose-500/15 text-rose-400'
                    : program.intensity === 'Menengah'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {program.intensity}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                {program.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                {program.subtitle}
              </p>

              {/* Stats readout */}
              <div className="flex items-center gap-3 text-xs text-slate-300 py-2.5 px-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 mb-4">
                <span className="flex items-center gap-1 font-mono">
                  <Clock size={13} className="text-orange-400" /> {program.durationMinutes} Menit
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-orange-400 font-bold">
                  <Flame size={13} /> ~{program.caloriesBurnedEst} kcal
                </span>
                <span>•</span>
                <span className="text-[11px] text-slate-400 truncate max-w-[80px]">
                  {program.targetMuscle}
                </span>
              </div>
            </div>

            <button
              onClick={() => startWorkout(program)}
              className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
            >
              <Play size={14} fill="currentColor" /> Mulai Sesi Ini
            </button>
          </div>
        ))}
      </div>

      {/* FULL-SCREEN INTERACTIVE WORKOUT PLAYER MODAL */}
      {activeProgram && currentInterval && (
        <div
          className={`fixed inset-0 z-50 flex flex-col justify-between p-6 transition-colors duration-700 safe-top safe-bottom ${
            currentInterval.isRest
              ? 'bg-gradient-to-b from-[#091528] via-[#0B1A33] to-[#060D1A]' // REST BLUE
              : 'bg-gradient-to-b from-[#251006] via-[#1F0C05] to-[#0A0605]' // WORK ORANGE
          }`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                currentInterval.isRest
                  ? 'bg-blue-500 text-slate-950'
                  : 'bg-orange-500 text-slate-950 animate-pulse'
              }`}>
                {currentInterval.isRest ? '🛌 RECOVERY REST' : '🔥 WORK INTERVAL'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentIntervalIdx + 1} / {activeProgram.intervals.length}
              </span>
            </div>

            <button
              onClick={handleClosePlayer}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Center Main Stage (Giant Timer & Exercise Name) */}
          <div className="flex flex-col items-center justify-center text-center my-auto py-8">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              {currentInterval.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md px-4 mb-8">
              {currentInterval.instruction}
            </p>

            {/* Giant Circular Countdown */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 ${
                currentInterval.isRest ? 'bg-blue-500' : 'bg-orange-500'
              }`} />
              <div className={`w-full h-full rounded-full border-8 flex flex-col items-center justify-center relative bg-black/40 backdrop-blur-xl ${
                currentInterval.isRest ? 'border-blue-500/80 shadow-2xl shadow-blue-500/30' : 'border-orange-500/80 shadow-2xl shadow-orange-500/30'
              }`}>
                <span className="text-6xl sm:text-7xl font-black tracking-tighter text-white font-mono">
                  {intervalRemainingSec}
                </span>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mt-1">
                  DETIK TERSISA
                </span>
              </div>
            </div>

            {/* Up Next Preview Pill */}
            {nextInterval && (
              <div className="mt-8 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                <span className="text-slate-400 font-medium">Berikutnya:</span>
                <strong className="text-white font-bold">{nextInterval.name}</strong>
                <span className="font-mono text-slate-400">({nextInterval.durationSeconds}s)</span>
              </div>
            )}
          </div>

          {/* Bottom Player Controls */}
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto w-full">
            <div className="flex items-center justify-center gap-6">
              {/* Prev */}
              <button
                onClick={handleSkipPrev}
                disabled={currentIntervalIdx === 0}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white flex items-center justify-center transition-all"
                title="Gerakan Sebelumnya"
              >
                <SkipBack size={20} />
              </button>

              {/* Pause / Resume */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center text-slate-950 font-black shadow-2xl transition-all ${
                  currentInterval.isRest
                    ? 'bg-blue-400 hover:bg-blue-300 shadow-blue-500/50'
                    : 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/50'
                }`}
                title={isPaused ? 'Lanjutkan' : 'Jeda'}
              >
                {isPaused ? <Play size={28} fill="currentColor" /> : <Pause size={28} fill="currentColor" />}
              </button>

              {/* Next */}
              <button
                onClick={handleSkipNext}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                title="Lewati ke Gerakan Berikutnya"
              >
                <SkipForward size={20} />
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Total Waktu Berjalan: {Math.floor(sessionElapsedSec / 60)}:{(sessionElapsedSec % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETION CELEBRATION MODAL */}
      {showCompletionModal && activeProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-xl">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-emerald-500/40 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">Latihan Selesai! 🎉</h2>
            <p className="text-xs text-slate-300 mt-1 mb-5">{activeProgram.title}</p>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 gap-3 mb-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Durasi Selesai</p>
                <p className="text-lg font-mono font-bold text-white mt-0.5">
                  {Math.floor(sessionElapsedSec / 60)}m {sessionElapsedSec % 60}s
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Kalori Terbakar</p>
                <p className="text-lg font-mono font-bold text-orange-400 mt-0.5">
                  +{activeProgram.caloriesBurnedEst} kcal
                </p>
              </div>
            </div>

            <button
              onClick={handleClosePlayer}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              Mantap, Kembali ke Dashboard!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
