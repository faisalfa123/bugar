import { ServerHealth, SyncPayload } from '../types';
import { localDB } from './db';

const AUTH_TOKEN_KEY = 'bugar_auth_token';
const SERVER_URL_KEY = 'bugar_server_url';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  serverHealth: ServerHealth | null;
  errorMessage: string | null;
}

class SyncService {
  private serverUrl: string = '';
  private listeners: ((state: SyncState) => void)[] = [];
  private state: SyncState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncTime: null,
    serverHealth: null,
    errorMessage: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.serverUrl = localStorage.getItem(SERVER_URL_KEY) || window.location.origin;
      window.addEventListener('online', () => this.updateOnlineStatus(true));
      window.addEventListener('offline', () => this.updateOnlineStatus(false));
    }
  }

  setServerUrl(url: string) {
    this.serverUrl = url.replace(/\/+$/, '');
    localStorage.setItem(SERVER_URL_KEY, this.serverUrl);
    this.checkHealth();
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  getAuthToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  }

  setAuthToken(token: string | null) {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    for (const l of this.listeners) {
      l(this.state);
    }
  }

  private updateOnlineStatus(online: boolean) {
    this.state.isOnline = online;
    this.notify();
    if (online) {
      this.syncNow();
    }
  }

  async checkHealth(): Promise<ServerHealth | null> {
    try {
      const res = await fetch(`${this.serverUrl}/api/health`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const health: ServerHealth = await res.json();
        this.state.serverHealth = health;
        this.state.isOnline = true;
        this.notify();
        return health;
      }
    } catch {
      // Server unreachable, fallback to offline
      this.state.serverHealth = null;
    }
    return null;
  }

  async verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${this.serverUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setAuthToken(data.token);
        this.checkHealth();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'PIN salah.' };
    } catch (e) {
      return { success: false, message: 'Tidak dapat menghubungi server ODROID-C2.' };
    }
  }

  async syncNow(): Promise<boolean> {
    if (this.state.isSyncing) return false;

    this.state.isSyncing = true;
    this.state.errorMessage = null;
    this.notify();

    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Step 1: Send local snapshot to server
      const localPayload: SyncPayload = await localDB.getFullSyncPayload();
      const pushRes = await fetch(`${this.serverUrl}/api/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(localPayload),
      });

      if (!pushRes.ok) {
        if (pushRes.status === 401) {
          throw new Error('PIN / Token autentikasi diperlukan.');
        }
        throw new Error(`Sync Push gagal: HTTP ${pushRes.status}`);
      }

      // Step 2: Fetch latest server snapshot
      const pullRes = await fetch(`${this.serverUrl}/api/sync`, {
        headers,
      });

      if (pullRes.ok) {
        const serverSnapshot: SyncPayload = await pullRes.json();
        await localDB.applyServerSnapshot(serverSnapshot);
      }

      this.state.lastSyncTime = Date.now();
      this.state.isOnline = true;
      await this.checkHealth();
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Koneksi sync gagal';
      this.state.errorMessage = msg;
      return false;
    } finally {
      this.state.isSyncing = false;
      this.notify();
    }
  }
}

export const syncService = new SyncService();
