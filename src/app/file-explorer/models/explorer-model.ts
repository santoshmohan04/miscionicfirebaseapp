export type FileType =
  | 'folder'
  | 'audio'
  | 'video'
  | 'image'
  | 'document'
  | 'zip'
  | 'apk'
  | 'unknown';

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
  path: string;          // SAF uri or virtual path
  isFolder: boolean;
  type: FileType;        // ✅ folder INCLUDED
  category?: FileCategory;
  meta?: string;
  selected?: boolean;
  selectable?: boolean;
  lastAccessed?: number;

  /* UI / metadata */
  size?: number;         // bytes (native later)
  mimeType?: string;     // native later
  lastModified?: number; // native later
}