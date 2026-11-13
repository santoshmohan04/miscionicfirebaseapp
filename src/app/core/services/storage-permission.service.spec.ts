import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { StoragePermissionService } from './storage-permission.service';

describe('StoragePermissionService', () => {
  let service: StoragePermissionService;

  beforeEach(() => {
    service = new StoragePermissionService();
  });

  it('does not report access when the Android Filesystem plugin is unavailable', async () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    spyOn(Capacitor, 'isPluginAvailable').and.returnValue(false);

    await expectAsync(service.check()).toBeResolvedTo(false);
    await expectAsync(service.request()).toBeResolvedTo(false);
  });

  it('fails closed when a permission check throws', async () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    spyOn(Capacitor, 'isPluginAvailable').and.returnValue(true);
    spyOn(Filesystem, 'checkPermissions').and.rejectWith(new Error('Permission API failed'));

    await expectAsync(service.check()).toBeResolvedTo(false);
  });

  it('fails closed when a permission request throws', async () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    spyOn(Capacitor, 'isPluginAvailable').and.returnValue(true);
    spyOn(Filesystem, 'requestPermissions').and.rejectWith(new Error('Permission API failed'));

    await expectAsync(service.request()).toBeResolvedTo(false);
  });
});
