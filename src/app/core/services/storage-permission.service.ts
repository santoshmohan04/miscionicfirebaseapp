import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class StoragePermissionService {

  async check(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') return true;

    const status = await Filesystem.checkPermissions();
    return status.publicStorage === 'granted';
  }

  async request(): Promise<boolean> {
    const status = await Filesystem.requestPermissions();
    return status.publicStorage === 'granted';
  }
}