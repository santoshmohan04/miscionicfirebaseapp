export interface FileItem {
  name: string;
  path: string;
  isFolder: boolean;
  type?: 'audio' | 'video';
  size?: number;
  duration?: number;
  meta?: string;
  selected?: boolean;
  selectable?: boolean;
}