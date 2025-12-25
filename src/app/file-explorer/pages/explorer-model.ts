export type FileType =
  | 'audio'
  | 'video'
  | 'image'
  | 'document'
  | 'zip'
  | 'app';

export type FileCategory =
  | 'pictures'
  | 'audio'
  | 'video'
  | 'documents'
  | 'zip'
  | 'apps';

export type ExplorerViewMode = 'category' | 'recent' | 'local';

export interface FileItem {
  name: string;
  path: string;

  /** Folder or file */
  isFolder: boolean;

  /** ONLY for files (never for folders) */
  type?: FileType;

  /** ONLY for category tiles */
  category?: FileCategory;

  /** UI metadata */
  meta?: string;

  /** Selection state */
  selected?: boolean;
  selectable?: boolean;

  /** Storage root flag (Internal / External) */
  isStorageRoot?: boolean;

  /** RECENT SUPPORT */
  lastAccessed?: number; // unix timestamp
}