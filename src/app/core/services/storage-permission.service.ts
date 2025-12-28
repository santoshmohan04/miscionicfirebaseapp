import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class StoragePermissionService {

  async check(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') return true;

    try {
      const status = await Filesystem.checkPermissions();
      return status.publicStorage === 'granted';
    } catch (error) {
      console.warn('Filesystem plugin not available, assuming permission granted:', error);
      return true; // Assume granted if plugin not available
    }
  }

  async request(): Promise<boolean> {
    try {
      const status = await Filesystem.requestPermissions();
      return status.publicStorage === 'granted';
    } catch (error) {
      console.warn('Filesystem plugin not available, assuming permission granted:', error);
      return true; // Assume granted if plugin not available
    }
  }
}