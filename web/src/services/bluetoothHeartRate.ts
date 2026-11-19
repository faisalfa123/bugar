// Web Bluetooth API Heart Rate Service (GATT standard UUID 0x180D)
export type HeartRateZone = 'warmup' | 'fat_burn' | 'cardio' | 'peak';

export interface HeartRateReading {
  bpm: number;
  zone: HeartRateZone;
  timestamp: number;
  batteryLevel?: number;
}

export type HeartRateCallback = (reading: HeartRateReading) => void;
export type ConnectionCallback = (connected: boolean, deviceName?: string) => void;

class BluetoothHeartRateManager {
  private device: any = null;
  private characteristic: any = null;
  private isConnected = false;
  private listeners: Set<HeartRateCallback> = new Set();
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private userAge = 28;

  public setAge(age: number) {
    this.userAge = age;
  }

  public getConnected(): boolean {
    return this.isConnected;
  }

  public getDeviceName(): string | undefined {
    return this.device?.name;
  }

  public onReading(callback: HeartRateCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public onConnectionChange(callback: ConnectionCallback) {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  public async connect(): Promise<{ success: boolean; error?: string }> {
    if (!('bluetooth' in navigator)) {
      return {
        success: false,
        error: 'Web Bluetooth tidak didukung di peramban ini. Silakan gunakan Google Chrome di Android/PC atau Bluefy di iOS.',
      };
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });

      this.device = device;
      device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateData.bind(this));
      this.characteristic = characteristic;

      // Optional: Read battery
      let batteryLevel: number | undefined;
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        const val = await batteryChar.readValue();
        batteryLevel = val.getUint8(0);
      } catch {
        // Battery service optional
      }

      this.isConnected = true;
      this.notifyConnection(true, device.name);

      return { success: true };
    } catch (err: any) {
      this.isConnected = false;
      this.notifyConnection(false);
      return { success: false, error: err.message || 'Gagal menyambungkan perangkat Bluetooth' };
    }
  }

  public disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.notifyConnection(false);
  }

  private onDisconnected() {
    this.isConnected = false;
    this.characteristic = null;
    this.notifyConnection(false);
  }

  private notifyConnection(connected: boolean, name?: string) {
    for (const listener of this.connectionListeners) {
      listener(connected, name);
    }
  }

  private handleHeartRateData(event: any) {
    const value = event.target.value;
    const flags = value.getUint8(0);
    let bpm = 0;

    // Check if 16-bit or 8-bit Heart Rate value
    if (flags & 0x01) {
      bpm = value.getUint16(1, /* littleEndian = */ true);
    } else {
      bpm = value.getUint8(1);
    }

    const zone = this.calculateZone(bpm);
    const reading: HeartRateReading = {
      bpm,
      zone,
      timestamp: Date.now(),
    };

    for (const listener of this.listeners) {
      listener(reading);
    }
  }

  private calculateZone(bpm: number): HeartRateZone {
    const maxHr = Math.max(160, 220 - this.userAge);
    const pct = bpm / maxHr;

    if (pct < 0.6) return 'warmup';
    if (pct < 0.7) return 'fat_burn';
    if (pct < 0.85) return 'cardio';
    return 'peak';
  }
}

export const bluetoothHeartRate = new BluetoothHeartRateManager();
