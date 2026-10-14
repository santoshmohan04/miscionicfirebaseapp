import { ExplorerViewMode, FileItem } from '../models/explorer-model';

export interface ExplorerState {
  files: FileItem[];
  currentPath: string;
  viewMode: ExplorerViewMode;
  selectionMode: boolean;
  selectedItems: FileItem[];
  loading: boolean;
  currentStorageLoading: string | null;

  clipboard?: {
    mode: 'copy' | 'move';
    items: FileItem[];
  };
}

export const initialExplorerState: ExplorerState = {
  files: [],
  currentPath: '/',
  viewMode: 'local',
  selectionMode: false,
  selectedItems: [],
  loading: false,
  currentStorageLoading: null,
};