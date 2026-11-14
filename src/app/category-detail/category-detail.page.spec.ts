import { ActivatedRoute } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { SafFileOps } from 'saf-file-ops';
import { FilesystemService } from '../core/services/filesystem.service';
import { CategoryDetailPage } from './category-detail.page';

describe('CategoryDetailPage selection', () => {
  const first = { id: '1', uri: 'content://media/1', name: 'one.jpg', path: '/one.jpg', size: 1, mimeType: 'image/jpeg', dateModified: 1 };
  const second = { id: '2', uri: 'content://media/2', name: 'two.jpg', path: '/two.jpg', size: 2, mimeType: 'image/jpeg', dateModified: 2 };
  let page: CategoryDetailPage;
  let alerts: jasmine.SpyObj<AlertController>;

  function dismissWith(role: string, values?: { name: string }) {
    alerts.create.and.returnValue(Promise.resolve({
      present: async () => {},
      onDidDismiss: async () => ({ role, data: { values } })
    } as HTMLIonAlertElement));
  }

  beforeEach(() => {
    alerts = jasmine.createSpyObj<AlertController>('AlertController', ['create']);
    dismissWith('cancel');
    page = new CategoryDetailPage({} as ActivatedRoute, {} as FilesystemService, {} as ToastController, alerts);
    page.files.set([first, second]);
  });

  it('keeps multiple selections when changing layout and clears them on cancel', () => {
    page.selectionMode.set(true);
    page.onFileClick(first);
    page.onFileClick(second);
    page.layout.set('grid');
    expect(page.selectedFiles()).toEqual([first, second]);

    page.onFileClick(first);
    expect(page.selectedFiles()).toEqual([second]);
    page.clearSelection();
    expect(page.selectedFiles()).toEqual([]);
    expect(page.selectionMode()).toBeFalse();
  });

  it('does not rename multiple selections or rename after cancellation', async () => {
    const rename = spyOn(SafFileOps, 'renameMedia');
    page.selectedIds.set(new Set(['1', '2']));
    await page.renameSelected();
    expect(alerts.create).not.toHaveBeenCalled();
    page.selectedIds.set(new Set(['1']));
    await page.renameSelected();
    expect(rename).not.toHaveBeenCalled();
  });

  it('does not replace files when confirmation is cancelled', async () => {
    page.selectedIds.set(new Set(['1']));
    spyOn(SafFileOps, 'pickRoot').and.resolveTo({ uri: 'content://folder', name: 'folder' });
    spyOn(SafFileOps, 'listFolder').and.resolveTo({
      items: [{ uri: 'content://existing', name: first.name, isFolder: false }]
    });
    const transfer = spyOn(SafFileOps, 'transferMedia');
    await page.transferSelected(false);
    expect(transfer).not.toHaveBeenCalled();
    expect(page.selectedFiles()).toEqual([first]);
  });

  it('passes the confirmed collision identity to the native operation', async () => {
    page.selectedIds.set(new Set(['1']));
    dismissWith('confirm');
    spyOn(SafFileOps, 'pickRoot').and.resolveTo({ uri: 'content://folder', name: 'folder' });
    spyOn(SafFileOps, 'listFolder').and.resolveTo({
      items: [{ uri: 'content://existing', name: first.name, isFolder: false }]
    });
    const transfer = spyOn(SafFileOps, 'transferMedia').and.resolveTo();
    spyOn(page, 'loadFiles').and.resolveTo();
    await page.transferSelected(true);
    expect(transfer).toHaveBeenCalledWith({
      uri: first.uri, name: first.name, targetUri: 'content://folder',
      existingUri: 'content://existing', move: true
    });
  });

  it('leaves selection intact when the folder picker is cancelled', async () => {
    page.selectedIds.set(new Set(['1']));
    spyOn(SafFileOps, 'pickRoot').and.rejectWith(new Error('Picker cancelled'));
    const transfer = spyOn(SafFileOps, 'transferMedia');
    await page.transferSelected(false);
    expect(transfer).not.toHaveBeenCalled();
    expect(alerts.create).not.toHaveBeenCalled();
    expect(page.selectedFiles()).toEqual([first]);
  });

  it('stops a bulk delete on failure and reports completed files', async () => {
    page.selectedIds.set(new Set(['1', '2']));
    dismissWith('confirm');
    spyOn(SafFileOps, 'deleteMedia').and.returnValues(Promise.resolve(), Promise.reject(new Error('Permission denied')));
    spyOn(page, 'loadFiles').and.resolveTo();
    await page.deleteSelected();
    expect(SafFileOps.deleteMedia).toHaveBeenCalledTimes(2);
    expect(alerts.create).toHaveBeenCalledWith(jasmine.objectContaining({
      header: 'Delete stopped', message: '1 of 2 completed. two.jpg: Permission denied'
    }));
    expect(page.loadFiles).toHaveBeenCalled();
  });
});
