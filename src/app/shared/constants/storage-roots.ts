import { FileItem } from '../../file-explorer/models/explorer-model';

export const STORAGE_ROOTS: FileItem[] = [
  {
    name: 'Internal Storage',
    path: '/internal',
    isFolder: true,
    type: 'folder',
    meta: 'Folder',
    selectable: false,
  },
  {
    name: 'External Storage',
    path: '/external',
    isFolder: true,
    type: 'folder',
    meta: 'Folder',
    selectable: false,
  },
];