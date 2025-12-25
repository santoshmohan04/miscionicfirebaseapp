import { FileItem } from './pages/explorer-model';

export const STORAGE_ROOTS: FileItem[] = [
  {
    name: 'Internal Storage',
    path: '/internal',
    isFolder: true,
    isStorageRoot: true,
    meta: 'Folder',
    selectable: false,
  },
  {
    name: 'External Storage',
    path: '/external',
    isFolder: true,
    isStorageRoot: true,
    meta: 'Folder',
    selectable: false,
  },
];