import { ExplorerViewMode, FileItem } from '../pages/explorer-model';

export interface ExplorerState {
  files: FileItem[];
  currentPath: string;
  pathStack: string[];
  viewMode: ExplorerViewMode;
  selectionMode: boolean;
  selectedItems: FileItem[];
  loading: boolean;
}

export const initialExplorerState: ExplorerState = {
  files: [],
  currentPath: '/',
  pathStack: [],
  viewMode: 'local',
  selectionMode: false,
  selectedItems: [],
  loading: false,
};