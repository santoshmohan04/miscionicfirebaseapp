import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class StoragePermissionService {

  async check(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') return true;

    if (!Capacitor.isPluginAvailable('Filesystem')) {
      return false;
    }

    try {
      const status = await Filesystem.checkPermissions();
      return status.publicStorage === 'granted';
    } catch (error) {
      console.warn('Filesystem permission check failed:', error);
      return false;
    }
  }

  async request(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') return true;

    if (!Capacitor.isPluginAvailable('Filesystem')) {
      return false;
    }

    try {
      const status = await Filesystem.requestPermissions();
      return status.publicStorage === 'granted';
    } catch (error) {
      console.warn('Filesystem permission request failed:', error);
      return false;
    }
  }
}