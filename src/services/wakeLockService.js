// Screen Wake Lock API to prevent phone screen from turning off while driving
class WakeLockService {
  constructor() {
    this.wakeLock = null;
    this.isLocked = false;
  }

  async requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.isLocked = true;
        this.wakeLock.addEventListener('release', () => {
          this.isLocked = false;
        });
        return true;
      } catch (err) {
        console.warn('Wake Lock request failed:', err.message);
        return false;
      }
    }
    return false;
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().then(() => {
        this.wakeLock = null;
        this.isLocked = false;
      });
    }
  }
}

export const wakeLockService = new WakeLockService();

