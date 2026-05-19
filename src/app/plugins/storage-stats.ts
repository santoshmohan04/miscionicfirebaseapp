import { registerPlugin } from '@capacitor/core';

export interface FileInfo {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  dateModified: number;
  thumbnailUri?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface LargestFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  category: string;
}

export interface StorageStatsPlugin {
  getStatistics(): Promise<{
    totalSpace: number;
    freeSpace: number;
    usedSpace: number;
    imagesSize: number;
    videosSize: number;
    audioSize: number;
    documentsSize: number;
    imagesCount?: number;
    videosCount?: number;
    audioCount?: number;
    documentsCount?: number;
  }>;
  checkStoragePermission(): Promise<{ granted: boolean }>;
  requestStoragePermission(): Promise<void>;
  getFilesByCategory(options: { category: string; limit?: number }): Promise<{ files: FileInfo[] }>;
  getLargestFiles(options: { limit?: number }): Promise<{ files: LargestFile[] }>;
}

const StorageStats = registerPlugin<StorageStatsPlugin>('StorageStats');
export default StorageStats;
