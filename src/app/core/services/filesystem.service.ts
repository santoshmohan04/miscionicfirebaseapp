import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SafPicker } from 'saf-picker';
import { SafFileOps } from 'saf-file-ops';
import { FileItem } from '../../file-explorer/pages/explorer-model';

export interface SafRoot {
  uri: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class FilesystemService {

  private readonly SAF_ROOT_KEY = 'saf_root';

  async pickRootFolder(): Promise<SafRoot> {
    const root = await SafPicker.pickDirectory();

    await Preferences.set({
      key: this.SAF_ROOT_KEY,
      value: JSON.stringify(root),
    });

    return root;
  }

  async getSavedRoot(): Promise<SafRoot | null> {
    const { value } = await Preferences.get({ key: this.SAF_ROOT_KEY });
    return value ? JSON.parse(value) : null;
  }

  async clearSavedRoot(): Promise<void> {
    await Preferences.remove({ key: this.SAF_ROOT_KEY });
  }

  async readSafFolder(uri: string): Promise<FileItem[]> {
    const res = await SafPicker.listFiles({ uri });

    return res.files.map((f: any) => ({
      name: f.name,
      path: f.uri,
      isFolder: f.isFolder,
      type: f.isFolder ? 'folder' : this.detectType(f.name),
      selectable: !f.isFolder,
    }));
  }

  private detectType(name: string): any {
    const ext = name.split('.').pop()?.toLowerCase();
    if (!ext) return 'unknown';
    if (['mp3', 'aac', 'wav'].includes(ext)) return 'audio';
    if (['mp4', 'mkv'].includes(ext)) return 'video';
    if (['jpg', 'png'].includes(ext)) return 'image';
    if (['pdf', 'doc'].includes(ext)) return 'document';
    if (ext === 'apk') return 'apk';
    return 'unknown';
  }

  /* =============================
     MEDIASTORE (TEMP STUBS)
     ============================= */

  async loadMediaByCategory(_category: string): Promise<FileItem[]> {
    // TODO: MediaStore query (Audio / Video / Images)
    return [];
  }

  async loadRecentMedia(): Promise<FileItem[]> {
    // TODO: MediaStore sorted by lastModified
    return [];
  }

  /* =============================
     SAF FILE OPERATIONS (NATIVE)
     ============================= */

  async deleteSafItems(items: FileItem[]): Promise<void> {
    await SafFileOps.deleteItems({
      items: items.map((i: FileItem) => ({
        uri: i.path,
        name: i.name,
      })),
    });
  }

  async copySafItems(items: FileItem[], targetUri: string): Promise<void> {
    await SafFileOps.copyItems({
      targetUri,
      items: items.map((i: FileItem) => ({
        uri: i.path,
        name: i.name,
      })),
    });
  }

  async moveSafItems(items: FileItem[], targetUri: string): Promise<void> {
    await SafFileOps.moveItems({
      targetUri,
      items: items.map((i: FileItem) => ({
        uri: i.path,
        name: i.name,
      })),
    });
  }
}