import {
  UserProfile,
  FoodLog,
  WorkoutLog,
  CardioLog,
  FatBurnerLog,
  BodyMetricLog,
  DailyHabitLog,
  FoodItem,
  SyncPayload
} from '../types';

const DB_NAME = 'bugar_offline_db';
const DB_VERSION = 1;

class BugarIndexedDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('user_profiles')) {
            db.createObjectStore('user_profiles', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('food_logs')) {
            const store = db.createObjectStore('food_logs', { keyPath: 'id' });
            store.createIndex('date', 'date', { unique: false });
          }
          if (!db.objectStoreNames.contains('workout_logs')) {
            const store = db.createObjectStore('workout_logs', { keyPath: 'id' });
            store.createIndex('date', 'date', { unique: false });
          }
          if (!db.objectStoreNames.contains('cardio_logs')) {
            const store = db.createObjectStore('cardio_logs', { keyPath: 'id' });
            store.createIndex('date', 'date', { unique: false });
          }
          if (!db.objectStoreNames.contains('fat_burner_logs')) {
            const store = db.createObjectStore('fat_burner_logs', { keyPath: 'id' });
            store.createIndex('date', 'date', { unique: false });
          }
          if (!db.objectStoreNames.contains('body_metric_logs')) {
            const store = db.createObjectStore('body_metric_logs', { keyPath: 'id' });
            store.createIndex('date', 'date', { unique: false });
          }
          if (!db.objectStoreNames.contains('daily_habit_logs')) {
            const store = db.createObjectStore('daily_habit_logs', { keyPath: 'id' });
            store.createIndex('date', 'date', { unique: false });
          }
          if (!db.objectStoreNames.contains('custom_foods')) {
            db.createObjectStore('custom_foods', { keyPath: 'id' });
          }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return this.dbPromise;
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  private async put<T>(storeName: string, item: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private async delete(storeName: string, id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Profile methods
  async getProfile(): Promise<UserProfile | null> {
    const list = await this.getAll<UserProfile>('user_profiles');
    return list[0] || null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.put('user_profiles', profile);
  }

  // Food log methods
  async getFoodLogs(date?: string): Promise<FoodLog[]> {
    const list = await this.getAll<FoodLog>('food_logs');
    if (date) {
      return list.filter(item => item.date === date);
    }
    return list.sort((a, b) => b.updated_at - a.updated_at);
  }

  async saveFoodLog(log: FoodLog): Promise<void> {
    await this.put('food_logs', log);
  }

  async deleteFoodLog(id: string): Promise<void> {
    await this.delete('food_logs', id);
  }

  // Workout log methods
  async getWorkoutLogs(): Promise<WorkoutLog[]> {
    const list = await this.getAll<WorkoutLog>('workout_logs');
    return list.sort((a, b) => b.updated_at - a.updated_at);
  }

  async saveWorkoutLog(log: WorkoutLog): Promise<void> {
    await this.put('workout_logs', log);
  }

  // Cardio log methods
  async getCardioLogs(): Promise<CardioLog[]> {
    const list = await this.getAll<CardioLog>('cardio_logs');
    return list.sort((a, b) => b.updated_at - a.updated_at);
  }

  async saveCardioLog(log: CardioLog): Promise<void> {
    await this.put('cardio_logs', log);
  }

  // Fat burner log methods
  async getFatBurnerLogs(): Promise<FatBurnerLog[]> {
    const list = await this.getAll<FatBurnerLog>('fat_burner_logs');
    return list.sort((a, b) => b.updated_at - a.updated_at);
  }

  async saveFatBurnerLog(log: FatBurnerLog): Promise<void> {
    await this.put('fat_burner_logs', log);
  }

  // Body metric methods
  async getBodyMetricLogs(): Promise<BodyMetricLog[]> {
    const list = await this.getAll<BodyMetricLog>('body_metric_logs');
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }

  async saveBodyMetricLog(log: BodyMetricLog): Promise<void> {
    await this.put('body_metric_logs', log);
  }

  // Daily habit methods
  async getDailyHabitLogs(date?: string): Promise<DailyHabitLog[]> {
    const list = await this.getAll<DailyHabitLog>('daily_habit_logs');
    if (date) {
      return list.filter(item => item.date === date);
    }
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }

  async saveDailyHabitLog(log: DailyHabitLog): Promise<void> {
    await this.put('daily_habit_logs', log);
  }

  // Custom food methods
  async getCustomFoods(): Promise<FoodItem[]> {
    return this.getAll<FoodItem>('custom_foods');
  }

  async saveCustomFood(food: FoodItem): Promise<void> {
    await this.put('custom_foods', food);
  }

  // Export full snapshot for sync
  async getFullSyncPayload(): Promise<SyncPayload> {
    const [profile, food_logs, workout_logs, cardio_logs, fat_burner_logs, body_metric_logs, daily_habit_logs] =
      await Promise.all([
        this.getProfile(),
        this.getAll<FoodLog>('food_logs'),
        this.getAll<WorkoutLog>('workout_logs'),
        this.getAll<CardioLog>('cardio_logs'),
        this.getAll<FatBurnerLog>('fat_burner_logs'),
        this.getAll<BodyMetricLog>('body_metric_logs'),
        this.getAll<DailyHabitLog>('daily_habit_logs'),
      ]);

    return {
      profile: profile || undefined,
      food_logs,
      workout_logs,
      cardio_logs,
      fat_burner_logs,
      body_metric_logs,
      daily_habit_logs,
      client_timestamp: Date.now(),
    };
  }

  // Apply server snapshot to local IndexedDB with Last-Write-Wins (LWW)
  async applyServerSnapshot(snapshot: SyncPayload): Promise<void> {
    if (snapshot.profile) {
      const local = await this.getProfile();
      if (!local || snapshot.profile.updated_at > local.updated_at) {
        await this.saveProfile(snapshot.profile);
      }
    }

    const mergeStore = async <T extends { id: string; updated_at: number }>(
      storeName: string,
      serverItems: T[]
    ) => {
      const localItems = await this.getAll<T>(storeName);
      const localMap = new Map(localItems.map(i => [i.id, i]));
      for (const item of serverItems) {
        const local = localMap.get(item.id);
        if (!local || item.updated_at > local.updated_at) {
          await this.put(storeName, item);
        }
      }
    };

    await Promise.all([
      mergeStore('food_logs', snapshot.food_logs || []),
      mergeStore('workout_logs', snapshot.workout_logs || []),
      mergeStore('cardio_logs', snapshot.cardio_logs || []),
      mergeStore('fat_burner_logs', snapshot.fat_burner_logs || []),
      mergeStore('body_metric_logs', snapshot.body_metric_logs || []),
      mergeStore('daily_habit_logs', snapshot.daily_habit_logs || []),
    ]);
  }
}

export const localDB = new BugarIndexedDB();
