import { Injectable } from '@angular/core';
import { SafFileOps } from 'saf-file-ops';
import { FileItem, FileType } from 'src/app/file-explorer/models/explorer-model';
import StorageStats from 'src/app/plugins/storage-stats';

export interface SafRoot {
  uri: string;
  name: string;
}

export class StorageAccessError extends Error {
  constructor(
    readonly code: 'permission-denied' | 'query-failed',
    message: string,
    readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'StorageAccessError';
  }
}

@Injectable({ providedIn: 'root' })
export class FilesystemService {
  private readonly categoryMap: Record<string, string> = {
    pictures: 'images',
    image: 'images',
    images: 'images',
    video: 'videos',
    videos: 'videos',
    audio: 'audio',
    documents: 'downloads',
    document: 'downloads',
    downloads: 'downloads',
    zip: 'downloads',
    apps: 'downloads',
  };

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
    return [
      {
        name: 'Internal Storage',
        path: 'internal',
        isFolder: true,
        type: 'folder',
        selectable: false,
      },
      {
        name: 'External Storage',
        path: 'external',
        isFolder: true,
        type: 'folder',
        selectable: false,
      },
    ];
  }

  async getSavedRoot(storageKey?: string): Promise<SafRoot | null> {
    try {
      const key = storageKey || 'default';
      const root = await SafFileOps.getPersistedRoot({ key });
      console.log('Saved root for', key, ':', root);

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
        type: f.isFolder ? 'folder' : this.detectType(f.name, f.mimeType),
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

  async getFilesByCategory(category: string): Promise<any[]> {
    const nativeCategory = this.categoryMap[category] ?? category;

    try {
      console.log('=== Getting files by category ===');
      console.log('Category:', category);

      try {
        const permStatus = await StorageStats.checkStoragePermission();
        console.log('Permission status:', permStatus);

        if (!permStatus.granted) {
          throw new StorageAccessError('permission-denied', 'Storage permission not granted');
        }
      } catch (permError) {
        if (permError instanceof StorageAccessError) throw permError;
        console.error('Error checking permissions:', permError);
        throw new StorageAccessError('query-failed', 'Unable to check storage permission', permError);
      }

      console.log('Calling StorageStats.getFilesByCategory...');
      const result = await StorageStats.getFilesByCategory({ category: nativeCategory, limit: 10000 });
      console.log('Native plugin result:', result);
      console.log('Files count:', result.files?.length || 0);
      return result.files ?? [];
    } catch (error) {
      if (error instanceof StorageAccessError) throw error;
      console.error('Error getting files by category:', error);
      throw new StorageAccessError('query-failed', 'Unable to query files for category', error);
    }
  }

  async getExplorerFilesByCategory(category: string): Promise<FileItem[]> {
    const files = await this.getFilesByCategory(category);
    return files.map((file) => this.toExplorerItem(file));
  }

  private toExplorerItem(file: any): FileItem {
    const mimeType = file.mimeType || '';
    return {
      name: file.name,
      path: file.path,
      isFolder: false,
      type: this.detectType(file.name, mimeType),
      selectable: true,
      size: file.size,
      mimeType,
      lastModified: file.dateModified,
      lastAccessed: file.dateModified,
      meta: this.formatMeta(file.size, file.dateModified),
    };
  }

  private formatMeta(size?: number, timestamp?: number): string | undefined {
    if (!size && !timestamp) return undefined;
    const sizeLabel = typeof size === 'number' ? this.formatSize(size) : '';
    const dateLabel = typeof timestamp === 'number' ? new Date(timestamp).toLocaleDateString() : '';

    if (sizeLabel && dateLabel) return `${sizeLabel} • ${dateLabel}`;
    return sizeLabel || dateLabel || undefined;
  }

  private formatSize(bytes: number): string {
    if (bytes <= 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  private detectType(name: string, mimeType?: string): FileType {
    if (mimeType?.startsWith('audio/')) return 'audio';
    if (mimeType?.startsWith('video/')) return 'video';
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType?.includes('zip')) return 'zip';
    if (mimeType?.includes('android.package-archive')) return 'apk';
    if (mimeType) return 'document';

    const ext = name.split('.').pop()?.toLowerCase();
    if (!ext) return 'unknown';

    if (['mp3', 'aac', 'wav', 'm4a'].includes(ext)) return 'audio';
    if (['mp4', 'mkv', '3gp', 'avi'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document';
    if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
    if (ext === 'apk') return 'apk';

    return 'unknown';
  }

  async loadRecentMedia(): Promise<FileItem[]> {
    // TODO: MediaStore sorted by lastModified
    return [];
  }

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
