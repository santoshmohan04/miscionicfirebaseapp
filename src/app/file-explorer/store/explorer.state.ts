// explorer.state.ts
import { FileItem } from '../pages/explorer-model';

export interface ExplorerState {
  currentPath: string;
  files: FileItem[];
  selectedItems: FileItem[];
  loading: boolean;
  selectionMode: boolean;
}

export const initialExplorerState: ExplorerState = {
  currentPath: '/',
  files: [],
  selectedItems: [],
  loading: false,
  selectionMode: false,
};