import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck, AlertCircle } from 'lucide-react';
import { syncService } from '../services/syncService';

interface PinLockModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ isOpen, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    if (pin.length < 6) {
      const nextPin = pin + d;
      setPin(nextPin);
      setError(null);
      if (nextPin.length >= 4) {
        // Auto-attempt when 4 or 6 digits
        attemptVerify(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const attemptVerify = async (code: string) => {
    setLoading(true);
    const result = await syncService.verifyPin(code);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      if (code.length >= 6) {
        setError(result.message);
        setPin('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-xl">
      <div className="w-full max-w-xs rounded-3xl glass-panel p-6 border border-slate-700/60 shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Lock size={26} />
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight">Kunci Akses BUGAR</h2>
        <p className="text-xs text-slate-400 mt-1 mb-5">Masukkan PIN keamanan edge server ODROID-C2</p>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[0, 1, 2, 3, 4, 5].map(idx => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                idx < pin.length
                  ? 'bg-emerald-400 scale-110 shadow-sm shadow-emerald-400'
                  : 'bg-slate-700/60 border border-slate-600/50'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 mb-3 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              disabled={loading}
              className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/70 active:bg-emerald-500 active:text-slate-950 text-xl font-bold text-white border border-slate-700/50 transition-all flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="h-14 rounded-2xl bg-slate-900/60 hover:bg-slate-800/60 text-xs font-semibold text-slate-400 flex items-center justify-center"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            disabled={loading}
            className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/70 active:bg-emerald-500 active:text-slate-950 text-xl font-bold text-white border border-slate-700/50 transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 flex items-center justify-center"
          >
            <Delete size={20} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Proteksi Sandi Server Lokal</span>
        </div>
      </div>
    </div>
  );
};
