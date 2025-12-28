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

  constructor(private fs: FilesystemService) {}

  /* ==========================
     ROOT (Internal / External)
     ========================== */
  async openRoot(): Promise<FileItem[]> {
    if (this.pathStack.length === 0) {
      const saved = await this.fs.getSavedRoot();

      const root = saved ?? await this.fs.pickRootFolder();

      this.pathStack = [{ uri: root.uri, name: root.name }];
    }

    return this.fs.readSafFolder(this.currentUri);
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
    if (this.pathStack.length <= 1) return null;

    this.pathStack.pop();
    return this.fs.readSafFolder(this.currentUri);
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