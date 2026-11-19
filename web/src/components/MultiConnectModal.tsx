import React, { useState, useEffect } from 'react';
import { bluetoothHeartRate, HeartRateReading } from '../services/bluetoothHeartRate';
import { t } from '../data/i18n';

interface MultiConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiConnectModal: React.FC<MultiConnectModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'smartband' | 'gymcast' | 'apple_google'>('smartband');
  const [isBleConnected, setIsBleConnected] = useState(bluetoothHeartRate.getConnected());
  const [deviceName, setDeviceName] = useState(bluetoothHeartRate.getDeviceName());
  const [hrReading, setHrReading] = useState<HeartRateReading | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Gym Cast state
  const [castMode, setCastMode] = useState<'off' | 'broadcast' | 'display'>('off');
  const [latestCast, setLatestCast] = useState<any>(null);

  useEffect(() => {
    const unsubConn = bluetoothHeartRate.onConnectionChange((connected, name) => {
      setIsBleConnected(connected);
      setDeviceName(name);
      if (!connected) setHrReading(null);
    });

    const unsubHr = bluetoothHeartRate.onReading((reading) => {
      setHrReading(reading);
    });

    return () => {
      unsubConn();
      unsubHr();
    };
  }, []);

  // Poll Gym Cast status if in display mode
  useEffect(() => {
    if (castMode !== 'display' || !isOpen) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/cast/status');
        if (res.ok) {
          const data = await res.json();
          setLatestCast(data);
        }
      } catch {
        // network polling fallback
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [castMode, isOpen]);

  if (!isOpen) return null;

  const handleConnectBle = async () => {
    setErrorMsg('');
    setIsConnecting(true);
    const res = await bluetoothHeartRate.connect();
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menyambungkan Bluetooth');
    }
    setIsConnecting(false);
  };

  const handleDisconnectBle = () => {
    bluetoothHeartRate.disconnect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('multiConnect')} Hub
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hubungkan Smartband BLE, Sinkronisasi Apple Health/Google Fit, dan Multi-Screen Gym Cast.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            style={{ cursor: 'pointer' }}
            aria-label={t('close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1.5 p-1 mt-4 bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('smartband')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'smartband'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ cursor: 'pointer' }}
          >
            ⌚ Smartband BLE
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gymcast')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'gymcast'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ cursor: 'pointer' }}
          >
            📺 Gym Cast
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apple_google')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'apple_google'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ cursor: 'pointer' }}
          >
            🍎 Apple / Google
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 overflow-y-auto flex-1 space-y-4 pr-1">
          {activeTab === 'smartband' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">
                      {isBleConnected ? `${t('smartbandConnected')}: ${deviceName || 'Smartband'}` : t('smartbandConnect')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Standar Bluetooth GATT Heart Rate (Xiaomi Band, Garmin, Polar, Fitbit).
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    isBleConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {isBleConnected ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 mb-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
                    {errorMsg}
                  </div>
                )}

                {isBleConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center p-6 bg-slate-900/80 rounded-xl border border-slate-700/50">
                      <div className="text-center">
                        <div className="text-5xl font-extrabold text-rose-500 flex items-center justify-center gap-2 animate-pulse">
                          ❤️ {hrReading ? hrReading.bpm : '--'}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                          Detak Jantung ({t('bpm')})
                        </div>
                        {hrReading && (
                          <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Zona: {t(`zone${hrReading.zone.charAt(0).toUpperCase() + hrReading.zone.slice(1).replace('_', '')}` as any) || hrReading.zone}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnectBle}
                      className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
                      style={{ cursor: 'pointer' }}
                    >
                      Putuskan Koneksi Smartband
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectBle}
                    disabled={isConnecting}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ cursor: isConnecting ? 'not-allowed' : 'pointer' }}
                  >
                    {isConnecting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Mencari Smartband di Sekitar...
                      </>
                    ) : (
                      '🔍 Pindai & Sambungkan Smartband'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'gymcast' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <h3 className="text-sm font-semibold text-slate-200">
                  {t('gymCast')} (Multi-Screen Real-Time)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Buka aplikasi bugar di layar TV/Laptop pada browser yang sama di jaringan Wi-Fi lokal ODROID-C2 untuk melihat siaran langsung sesi latihan.
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setCastMode('broadcast')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      castMode === 'broadcast'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-slate-100'
                        : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="font-bold text-xs text-emerald-400">📱 Mode Pengontrol (HP)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Kirim data workout & timer ke layar besar</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCastMode('display')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      castMode === 'display'
                        ? 'bg-blue-500/20 border-blue-500/50 text-slate-100'
                        : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="font-bold text-xs text-blue-400">📺 Mode Penampil (TV/PC)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Tampilkan video latihan & timer besar</div>
                  </button>
                </div>

                {castMode === 'display' && (
                  <div className="mt-4 p-4 bg-slate-900 border border-blue-500/40 rounded-xl">
                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                      Status Siaran Latihan Terkini
                    </div>
                    {latestCast ? (
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-slate-100">{latestCast.exercise_name}</div>
                        <div className="flex gap-4 text-xs text-slate-300">
                          <div>Set: <span className="font-bold text-emerald-400">{latestCast.current_set}</span></div>
                          <div>Reps: <span className="font-bold text-emerald-400">{latestCast.current_reps}</span></div>
                          <div>Waktu: <span className="font-bold text-emerald-400">{latestCast.elapsed_seconds}s</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        Menunggu sinyal latihan aktif dari perangkat ponsel...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'apple_google' && (
            <div className="space-y-4">
              {/* Apple Health */}
              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🍎</span>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Apple Health (iPhone & Apple Watch)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Sinkronkan langkah harian, kalori aktif, dan durasi olahraga via Apple Shortcuts atau aplikasi Health Auto Export langsung ke endpoint lokal ODROID-C2.
                </p>
                <div className="p-2.5 bg-slate-900/90 rounded-lg text-xs font-mono text-emerald-400 select-all border border-slate-700">
                  POST http://[IP_ODROID]:1200/api/health-connect/sync
                </div>
              </div>

              {/* Google Fit */}
              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🤖</span>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Google Fit & Health Connect (Android)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Kirimkan data aktivitas fisik harian, langkah, dan detak jantung langsung dari ponsel Android.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/health-connect/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_id: 'default-user',
                          source: 'google_fit',
                          date: new Date().toISOString().split('T')[0],
                          steps: 6500,
                          active_calories: 320,
                        }),
                      });
                      if (res.ok) {
                        alert('Simulasi sinkronisasi data Google Fit berhasil disimpan!');
                      }
                    } catch {
                      alert('Gagal terhubung ke endpoint kesehatan.');
                    }
                  }}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-slate-100 font-semibold rounded-lg text-xs transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  Uji Kirim Data Sinkronisasi Google Fit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-xl text-xs transition-colors"
            style={{ cursor: 'pointer' }}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
