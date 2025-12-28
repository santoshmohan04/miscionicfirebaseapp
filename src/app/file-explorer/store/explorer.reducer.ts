import { createReducer, on } from '@ngrx/store';
import * as ExplorerActions from './explorer.actions';
import { ExplorerState, initialExplorerState } from './explorer.state';
import { CATEGORY_ITEMS } from '../file-categories';
import { STORAGE_ROOTS } from '../storage-roots';
import { ExplorerViewMode } from '../pages/explorer-model';

export const explorerReducer = createReducer<ExplorerState>(
  initialExplorerState,

  /* =======================
     LOCAL ROOTS
     ======================= */
  on(ExplorerActions.loadLocalRoots, (state) => ({
    ...state,
    viewMode: 'local' as ExplorerViewMode,
    currentPath: '/',
    pathStack: [],
    files: STORAGE_ROOTS.map(r => ({
      ...r,
      selected: false,
      selectable: false,
    })),
    selectionMode: false,
    selectedItems: [],
  })),

  /* =======================
     LOAD FOLDER
     ======================= */
  on(ExplorerActions.loadFolder, (state, { path }) => ({
    ...state,
    currentPath: path,
    loading: true,
    selectionMode: false,
    selectedItems: [],
  })),

  on(ExplorerActions.loadFolderSuccess, (state, { files }) => ({
    ...state,
    files: files.map(f => ({
      ...f,
      selected: false,
      selectable: !f.isFolder,
    })),
    loading: false,
  })),

  /* =======================
     SELECTION MODE
     ======================= */
  on(ExplorerActions.enterSelectionMode, (state, { item }) => {
    const files = state.files.map(f =>
      f.path === item.path
        ? { ...f, selected: true }
        : { ...f, selected: false }
    );

    return {
      ...state,
      selectionMode: true,
      files,
      selectedItems: files.filter(f => f.selected),
    };
  }),

  on(ExplorerActions.selectItem, (state, { item }) => {
    const files = state.files.map(f =>
      f.path === item.path ? { ...f, selected: !f.selected } : f
    );

    return {
      ...state,
      files,
      selectedItems: files.filter(f => f.selected),
    };
  }),

  on(ExplorerActions.exitSelectionMode, (state) => ({
    ...state,
    selectionMode: false,
    files: state.files.map(f => ({
      ...f,
      selected: false,
      selectable: false,
    })),
    selectedItems: [],
  })),

  /* =======================
     VIEW MODE
     ======================= */
  on(ExplorerActions.setViewMode, (state, { mode }) => ({
    ...state,
    viewMode: mode as ExplorerViewMode,
    selectionMode: false,
    selectedItems: [],
  })),

  /* =======================
     CATEGORY VIEW
     ======================= */
  on(ExplorerActions.loadCategoryView, (state) => ({
    ...state,
    viewMode: 'category' as ExplorerViewMode,
    currentPath: '/',
    files: CATEGORY_ITEMS.map(c => ({
      ...c,
      selected: false,
      selectable: false,
    })),
    selectionMode: false,
    selectedItems: [],
  })),

  on(ExplorerActions.openCategory, (state, { category }) => ({
    ...state,
    viewMode: 'local' as ExplorerViewMode,
    currentPath: category,
    selectionMode: false,
    selectedItems: [],
    files: state.files.filter(f => f.category === category),
  })),

  /* =======================
     RECENT VIEW
     ======================= */
  on(ExplorerActions.loadRecentView, (state) => ({
    ...state,
    viewMode: 'recent' as ExplorerViewMode,
    currentPath: 'Recent',
    selectionMode: false,
    selectedItems: [],
    files: [...state.files]
      .filter(f => !f.isFolder && f.lastAccessed)
      .sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0))
      .map(f => ({
        ...f,
        selected: false,
        selectable: false,
      })),
  })),

  /* =======================
     FILE OPERATIONS
     ======================= */
  on(ExplorerActions.startCopy, (state) => ({
    ...state,
    clipboard: {
      mode: 'copy',
      items: state.selectedItems,
    },
    selectionMode: false,
  })),

  on(ExplorerActions.startMove, (state) => ({
    ...state,
    clipboard: {
      mode: 'move',
      items: state.selectedItems,
    },
    selectionMode: false,
  })),

  on(ExplorerActions.fileOpSuccess, (state) => ({
    ...state,
    clipboard: undefined,
    selectedItems: [],
    selectionMode: false,
  })),
);