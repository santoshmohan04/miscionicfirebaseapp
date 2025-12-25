// explorer.state.ts
import { FileItem } from '../../../core/models/file-item.model';

export interface ExplorerState {
  currentPath: string;
  files: FileItem[];
  selectedItems: FileItem[];
  loading: boolean;
}

export const initialExplorerState: ExplorerState = {
  currentPath: '/',
  files: [],
  selectedItems: [],
  loading: false,
};