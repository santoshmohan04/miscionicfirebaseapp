import { Injectable } from '@angular/core';
import { SafFileOps } from 'saf-file-ops';
import { FileItem } from '../../file-explorer/pages/explorer-model';

export interface SafRoot {
  uri: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class FilesystemService {

  async pickRootFolder(storageKey?: string): Promise<SafRoot> {
    try {
      console.log('Picking root folder...');
      const root = await SafFileOps.pickRoot();
      console.log('Root picked:', root);
      
      if (!root || !root.uri) {
        throw new Error('Invalid root returned from picker');
      }
      
      await this.persistRoot(root.uri, root.name, storageKey);
      console.log('Root persisted with key:', storageKey || 'default');
      return root;
    } catch (error) {
      console.error('Error picking root:', error);
      throw error;
    }
  }

  getStorageList(): FileItem[] {
    // Return available storage options
    // Note: We can't get actual storage info without SAF permissions
    // So we return generic storage options
    return [
      {
        name: 'Internal Storage',
        path: 'internal',
        isFolder: true,
        type: 'folder',
        selectable: false,
        size: undefined,
        mimeType: undefined,
        lastModified: undefined,
      },
      {
        name: 'External Storage',
        path: 'external',
        isFolder: true,
        type: 'folder',
        selectable: false,
        size: undefined,
        mimeType: undefined,
        lastModified: undefined,
      },
    ];
  }

  async getSavedRoot(storageKey?: string): Promise<SafRoot | null> {
    try {
      const key = storageKey || 'default';
      const root = await SafFileOps.getPersistedRoot({ key });
      console.log('Saved root for', key, ':', root);
      
      // Check if root has valid uri property
      if (!root || !root.uri) {
        console.log('No valid saved root found for', key);
        return null;
      }
      
      return root;
    } catch (error) {
      console.error('Error getting saved root:', error);
      return null;
    }
  }

  async persistRoot(uri: string, name: string, key?: string): Promise<void> {
    try {
      console.log('Persisting root:', uri, name, 'with key:', key || 'default');
      await SafFileOps.persistRoot({ uri, name, key: key || 'default' });
      console.log('Root persisted successfully');
    } catch (error) {
      console.error('Error persisting root:', error);
      throw error;
    }
  }

  async readSafFolder(uri: string): Promise<FileItem[]> {
    try {
      console.log('Reading SAF folder:', uri);
      const res = await SafFileOps.listFolder({ uri });
      console.log('Folder contents:', res.items);

      return res.items.map((f: any) => ({
        name: f.name,
        path: f.uri,
        isFolder: f.isFolder,
        type: f.isFolder ? 'folder' : this.detectType(f.name),
        selectable: !f.isFolder,
        size: f.size,
        mimeType: f.mimeType,
        lastModified: f.lastModified,
      }));
    } catch (error) {
      console.error('Error reading SAF folder:', error);
      throw error;
    }
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