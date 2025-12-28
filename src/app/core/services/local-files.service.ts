import { Injectable } from '@angular/core';
import { FilesystemService } from './filesystem.service';
import { FileItem } from 'src/app/file-explorer/pages/explorer-model';

interface PathNode {
  uri: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LocalFilesService {
  private pathStack: PathNode[] = [];
  private currentStorageName: string | null = null;
  private isPickerOpen = false;

  constructor(private fs: FilesystemService) {}

  /* ==========================
     ROOT (Internal / External)
     ========================== */
  async openRoot(): Promise<FileItem[]> {
    console.log('LocalFilesService.openRoot() called');
    
    // If we already have a path stack, we're inside a storage, read current folder
    if (this.pathStack.length > 0) {
      console.log('Reading folder with URI:', this.currentUri);
      const result = await this.fs.readSafFolder(this.currentUri);
      console.log('Folder read result:', result);
      return result;
    }

    // Otherwise, return the storage list
    return this.fs.getStorageList();
  }

  /* ==========================
     OPEN STORAGE (Pick Root)
     ========================== */
  async openStorage(storageName: string): Promise<FileItem[]> {
    if (this.isPickerOpen) {
      console.log('Picker already open, ignoring request');
      throw new Error('Picker already open');
    }
    
    console.log('Opening storage:', storageName);
    
    // Generate storage-specific key
    const storageKey = storageName.toLowerCase().replace(/\s+/g, '-');
    console.log('Storage key:', storageKey);
    
    // Check if we have a saved root for this storage
    const saved = await this.fs.getSavedRoot(storageKey);
    
    let root;
    if (saved) {
      console.log('Using saved root:', saved);
      root = saved;
    } else {
      console.log('Picking new root folder...');
      this.isPickerOpen = true;
      try {
        root = await this.fs.pickRootFolder(storageKey);
        console.log('Picker completed, resetting flag');
        this.isPickerOpen = false;
      } catch (error) {
        console.error('Error picking root folder:', error);
        this.isPickerOpen = false;
        console.log('Picker error, flag reset');
        throw error;
      }
    }

    this.currentStorageName = storageName;
    this.pathStack = [{ uri: root.uri, name: root.name }];
    console.log('Path stack set:', this.pathStack);

    const result = await this.fs.readSafFolder(this.currentUri);
    console.log('Folder read result:', result);
    return result;
  }
  
  /* ==========================
     RESET PICKER STATE (for debugging)
     ========================== */
  resetPickerState(): void {
    console.log('Manually resetting picker state');
    this.isPickerOpen = false;
  }

  /* ==========================
     CHILD
     ========================== */
  async openFolder(item: FileItem): Promise<FileItem[]> {
    if (!item.isFolder) return [];

    this.pathStack.push({
      uri: item.path,
      name: item.name,
    });

    return this.fs.readSafFolder(this.currentUri);
  }

  /* ==========================
     BACK
     ========================== */
  async goBack(): Promise<FileItem[] | null> {
    if (this.pathStack.length > 1) {
      // Navigate up one folder
      this.pathStack.pop();
      return this.fs.readSafFolder(this.currentUri);
    }
    
    if (this.pathStack.length === 1) {
      // At storage root, go back to storage list
      this.pathStack = [];
      this.currentStorageName = null;
      return this.fs.getStorageList();
    }
    
    // Already at storage list
    return null;
  }

  /* ==========================
     BREADCRUMBS (UI)
     ========================== */
  get breadcrumbs(): string[] {
    return this.pathStack.map(p => p.name);
  }

  /* ==========================
     CURRENT SAF URI
     ========================== */
  get currentUri(): string {
    return this.pathStack[this.pathStack.length - 1].uri;
  }

  /* ==========================
     RESET (on tab switch)
     ========================== */
  reset(): void {
    this.pathStack = [];
    this.currentStorageName = null;
    this.isPickerOpen = false; // Also reset picker state
  }

  /* ==========================
     OPEN BY PATH (NgRx)
     ========================== */
  async openFolderByPath(path: string): Promise<FileItem[]> {
    const name = path.split('/').pop() || 'Folder';

    this.pathStack.push({
      uri: path,
      name,
    });

    return this.fs.readSafFolder(this.currentUri);
  }
}